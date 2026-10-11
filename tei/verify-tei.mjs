// SPDX-License-Identifier: 0BSD
// Maintainer: poplolioi11 (一卦 yigua.art), https://github.com/poplolioi11
// Independent XML parsing and lossless corpus round-trip checks.
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { ENCODING_VERSION, SOURCE_COMMIT, SOURCE_JSON_SHA256, SOURCE_TXT_SHA256, TEI_SCHEMA_URL, TEI_SCHEMA_SHA256, FOREIGN_NAMESPACE, sha256, validateSource, validateDoiRecord, loadReleaseOptions } from './convert-tei.mjs';

// Python's standard-library ElementTree independently parses the generated XML.
// The original JSON is never used by this parser to construct its body result.
const PARSER = String.raw`
import json, sys, xml.etree.ElementTree as ET
root = ET.fromstring(sys.stdin.buffer.read())
T = '{http://www.tei-c.org/ns/1.0}'
X = '{http://www.w3.org/XML/1998/namespace}'
F = '{${FOREIGN_NAMESPACE}}'
def content(element):
    return ''.join(element.itertext()) if element is not None else None
def direct(parent, tag):
    return parent.findall(T + tag)
def notes(parent, kind):
    return [n for n in direct(parent, 'note') if n.get('type') == kind]
divisions = root.findall('./' + T + 'text/' + T + 'body/' + T + 'div')
records = []
for div in divisions:
    source_notes = notes(div, 'source')
    source_refs = source_notes[0].findall(T + 'ref') if len(source_notes) == 1 else []
    ordinary = [a for a in direct(div, 'ab') if a.get('type') == 'ordinary']
    special = [a for a in direct(div, 'ab') if a.get('type') == 'special']
    statuses = notes(div, 'existing-review-status')
    source_note = notes(div, 'sourceNote')
    gaps = notes(div, 'special-source-gap')
    records.append({
      'id': div.get(X+'id'), 'type': div.get('type'), 'number': div.get('n'), 'corresp': div.get('corresp'),
      'name': content(div.find(T+'head')), 'heads': len(direct(div, 'head')),
      'statuses': [content(n) for n in statuses],
      'sources': [{'target': r.get('target'), 'text': content(r)} for r in source_refs],
      'sourceNotes': [content(n) for n in source_note],
      'ordinary': [{'id': a.get(X+'id'), 'n': a.get('n'), 'facs': a.get('facs'), 'text': content(a)} for a in ordinary],
      'special': [{'id': a.get(X+'id'), 'n': a.get('n'), 'facs': a.get('facs'), 'text': content(a)} for a in special],
      'gaps': [{'corresp': n.get('corresp'), 'text': content(n)} for n in gaps],
      'childTags': [c.tag for c in div], 'abCount': len(direct(div, 'ab')),
    })
embedded = root.findall('./' + T + 'teiHeader/' + T + 'xenoData/' + F + 'json')
header = root.find(T + 'teiHeader')
publication = header.find('./' + T + 'fileDesc/' + T + 'publicationStmt')
editions = header.findall('./' + T + 'fileDesc/' + T + 'editionStmt/' + T + 'edition')
print(json.dumps({
  'rootTag': root.tag, 'rootId': root.get(X+'id'),
  'allIds': [e.get(X+'id') for e in root.iter() if e.get(X+'id') is not None],
  'records': records, 'allDivs': len(root.findall('.//' + T + 'div')), 'allAbs': len(root.findall('.//' + T + 'ab')),
  'metadata': [content(e) for e in embedded],
  'idnos': [{'type': e.get('type'), 'text': content(e)} for e in publication.findall(T+'idno')],
  'editions': [{'n': e.get('n'), 'text': content(e)} for e in editions],
  'headerNotes': [{'type': e.get('type'), 'text': content(e)} for e in header.findall('./' + T + 'fileDesc/' + T + 'notesStmt/' + T + 'note')],
}, ensure_ascii=False))
`;

export function parseXml(xml) {
  // No DTD or custom entities are part of this encoding. Reject them explicitly.
  assert.ok(!/<!DOCTYPE|<!ENTITY/u.test(xml), 'unexpected DTD or entity declaration');
  const parsed = spawnSync(process.env.PYTHON ?? 'python3', ['-c', PARSER], {
    input: xml, encoding: 'utf8', maxBuffer: 8 * 1024 * 1024,
  });
  assert.ifError(parsed.error);
  assert.equal(parsed.status, 0, `XML parser rejected the document: ${parsed.stderr}`);
  return JSON.parse(parsed.stdout);
}

export function verifyXml(xml, sourceBytes, { doiRecord } = {}) {
  const dataset = validateSource(sourceBytes);
  const doi = validateDoiRecord(doiRecord);
  const parsed = parseXml(xml);
  assert.ok(xml.includes(`<?xml-model href="${TEI_SCHEMA_URL}"`), 'pinned TEI schema reference changed');
  assert.equal(parsed.rootTag, '{http://www.tei-c.org/ns/1.0}TEI', 'TEI namespace missing');
  assert.equal(parsed.rootId, 'wuying-lines-tei');
  assert.equal(parsed.allIds.length, new Set(parsed.allIds).size, 'duplicate xml:id');
  for (const id of parsed.allIds) assert.match(id, /^[A-Za-z_][A-Za-z0-9_.-]*$/u, 'invalid XML id');
  assert.equal(parsed.records.length, 64, 'expected 64 body divs');
  assert.equal(parsed.allDivs, 64, 'unexpected additional div');
  assert.equal(parsed.allAbs, 386, 'expected exactly 384 ordinary and two special ab');
  assert.equal(parsed.metadata.length, 1, 'expected one complete embedded source JSON');
  assert.equal(parsed.metadata[0], sourceBytes.toString('utf8'), 'embedded source JSON byte text changed');
  assert.equal(sha256(parsed.metadata[0]), SOURCE_JSON_SHA256);
  assert.deepEqual(JSON.parse(parsed.metadata[0]), dataset, 'embedded source metadata changed');
  assert.equal(parsed.editions.length, 1);
  assert.equal(parsed.editions[0].n, ENCODING_VERSION, 'TEI encoding version changed');
  const idnos = Object.fromEntries(parsed.idnos.map(id => [id.type, id.text]));
  assert.equal(idnos['source-git-commit'], SOURCE_COMMIT);
  assert.equal(idnos['source-json-sha256'], SOURCE_JSON_SHA256);
  assert.equal(idnos['source-txt-sha256'], SOURCE_TXT_SHA256);
  if (doi) {
    assert.equal(idnos.DOI, doi.doi, 'DOI differs from the externally checked release record');
  } else {
    assert.ok(!Object.keys(idnos).some(key => key.toLowerCase().includes('doi')), 'unexpected DOI without an externally checked release record');
  }
  const headerNotes = Object.fromEntries(parsed.headerNotes.map(note => [note.type, note.text]));
  assert.equal(headerNotes.scope, dataset.meta.scope);
  assert.equal(headerNotes['existing-review'], dataset.meta.review);
  assert.equal(headerNotes['source-export-date'], dataset.meta.exportedAt);
  assert.equal(headerNotes['source-metadata-date'], dataset.meta.metadataUpdatedAt);
  if (doi) {
    assert.ok(headerNotes['doi-status'].includes(doi.statusCheckedAt), 'DOI state check date missing');
    assert.ok(headerNotes['doi-status'].includes(doi.doi), 'DOI state identifier missing');
    assert.ok(headerNotes['doi-status'].includes(doi.status === 'reserved' ? '當次查核尚未發布' : '記錄已發布'), 'DOI state changed');
    assert.ok(headerNotes['doi-status'].includes('Zenodo 記錄為準'), 'DOI note must direct later status checks to the live record');
  }
  const reconstructed = [];
  let specialCount = 0;
  let sourceCount = 0;
  for (const [index, record] of parsed.records.entries()) {
    const original = dataset.hexagrams[index];
    const id = `h${String(index + 1).padStart(2, '0')}`;
    assert.equal(record.type, 'hexagram');
    assert.equal(record.id, id);
    assert.equal(record.number, String(index + 1), 'hexagram number or order changed');
    assert.equal(record.heads, 1);
    assert.equal(record.name, original.name);
    assert.deepEqual(record.statuses, [original.status], 'existing status changed');
    assert.deepEqual(record.sources, [{ target: original.sourceUrl, text: original.source }], 'sourceUrl or source description changed');
    assert.equal(record.corresp, index === 19 ? '#source-meiji' : '#source-harvard', 'holding institution assignment changed');
    assert.equal(record.ordinary.length, 6);
    assert.equal(record.abCount, original.special ? 7 : 6, 'unrecognized or extra ab');
    assert.ok(record.childTags.every(tag => ['div', 'head', 'note', 'ab'].includes(tag.replace('{http://www.tei-c.org/ns/1.0}', ''))), 'unexpected reading-content tag');
    for (const [position, line] of record.ordinary.entries()) {
      assert.equal(line.id, `${id}-l${position + 1}`);
      assert.equal(line.n, String(position + 1));
      assert.equal(line.text, original.lines[position], 'ordinary reading text changed, including original separator or characters');
      assert.equal(line.facs, original.lineSources[position], 'lineSources URL changed');
      assert.equal(new URL(line.facs).hostname, index === 19 ? 'm-archives.meiji.jp' : 'nrs.harvard.edu');
      sourceCount += 1;
    }
    const recovered = {
      number: Number(record.number), name: record.name, status: record.statuses[0],
      lines: record.ordinary.map(line => line.text), lineSources: record.ordinary.map(line => line.facs),
      source: record.sources[0].text, sourceUrl: record.sources[0].target,
    };
    if (original.special) {
      assert.equal(record.special.length, 1);
      const special = record.special[0];
      assert.equal(special.id, `${id}-special`);
      assert.equal(special.n, original.special.label);
      assert.equal(special.facs, null, 'special statement has an invented independent page reference');
      assert.equal(special.text, `${original.special.label}：${original.special.text}`);
      assert.equal(record.gaps.length, 1);
      assert.equal(record.gaps[0].corresp, `#${id}-special`);
      assert.ok(record.gaps[0].text.includes('未附') && record.gaps[0].text.includes('獨立'), 'special source gap missing');
      const separator = special.text.indexOf('：');
      recovered.special = { label: special.text.slice(0, separator), text: special.text.slice(separator + 1) };
      specialCount += 1;
    } else {
      assert.equal(record.special.length, 0);
      assert.equal(record.gaps.length, 0);
    }
    if (original.sourceNote !== undefined) {
      assert.deepEqual(record.sourceNotes, [original.sourceNote], 'damaged-print/sourceNote changed');
      recovered.sourceNote = record.sourceNotes[0];
    } else {
      assert.equal(record.sourceNotes.length, 0);
    }
    reconstructed.push(recovered);
  }
  assert.deepEqual(reconstructed, dataset.hexagrams, 'body does not reconstruct the complete original hexagram records');
  assert.equal(sourceCount, 384);
  assert.equal(specialCount, 2);
  return {
    status: 'passed', encodingVersion: ENCODING_VERSION, sourceCommit: SOURCE_COMMIT,
    hexagrams: reconstructed.length, ordinaryLineStatements: sourceCount, ordinaryLineImageReferences: sourceCount,
    specialStatements: specialCount, uniqueXmlIds: parsed.allIds.length,
    readingTextRoundTrip: 'exact, including original fullwidth separators',
    metadataRoundTrip: 'full source JSON text and all body records',
    doiRecord: doi ?? { status: 'not-assigned' },
    limitations: ['No new scan collation or external URL availability check.', 'Special statements still lack independent page references.'],
  };
}

export function verifyText(xml, sourceBytes, txtBytes) {
  assert.equal(sha256(txtBytes), SOURCE_TXT_SHA256, 'source TXT is not the frozen export');
  const records = parseXml(xml).records;
  const blocks = records.map(record => [
    `${record.number} ${record.name}`,
    ...record.ordinary.map(line => line.text),
    ...record.special.map(line => line.text),
    ...record.ordinary.map(line => line.facs),
  ].join('\n'));
  const text = txtBytes.toString('utf8');
  for (const block of blocks) assert.ok(text.includes(block), 'reading text/source block differs from frozen TXT');
  validateSource(sourceBytes);
  return { frozenTxtSha256: SOURCE_TXT_SHA256, exactTxtHexagramBlocks: blocks.length };
}

export function validateRelaxNg(xmlPath, schemaPath) {
  assert.equal(sha256(readFileSync(schemaPath)), TEI_SCHEMA_SHA256, 'schema bytes differ from the pinned official TEI P5 4.12.0 schema');
  const result = spawnSync('xmllint', ['--nonet', '--noout', '--relaxng', schemaPath, xmlPath], { encoding: 'utf8' });
  assert.ifError(result.error);
  assert.equal(result.status, 0, `TEI Relax NG validation failed: ${result.stderr}`);
  return { status: 'passed', schema: 'TEI P5 4.12.0 tei_all.rng', schemaPath, schemaSha256: TEI_SCHEMA_SHA256 };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const sourcePath = resolve(process.argv[2] ?? fileURLToPath(new URL('../wuying-lines.json', import.meta.url)));
  const xmlPath = resolve(process.argv[3] ?? fileURLToPath(new URL('./wuying-lines.tei.xml', import.meta.url)));
  const externalSchemaPath = process.argv[4] ?? process.env.TEI_SCHEMA_PATH;
  const schemaPath = externalSchemaPath ? resolve(externalSchemaPath) : null;
  const txtPath = resolve(dirname(sourcePath), 'wuying-lines.txt');
  const [sourceBytes, xml, txtBytes] = await Promise.all([readFile(sourcePath), readFile(xmlPath, 'utf8'), readFile(txtPath)]);
  const options = process.argv[5]
    ? { doiRecord: { doi: process.argv[5], status: process.argv[6], statusCheckedAt: process.argv[7] } }
    : await loadReleaseOptions();
  const summary = { ...verifyXml(xml, sourceBytes, options), ...verifyText(xml, sourceBytes, txtBytes), teiSha256: sha256(xml) };
  if (schemaPath) {
    await access(schemaPath);
    summary.relaxNg = validateRelaxNg(xmlPath, schemaPath);
  } else {
    summary.relaxNg = { status: 'not-run', reason: 'No external pinned schema path was supplied; XML round-trip checks do not replace TEI schema validation.' };
  }
  console.log(JSON.stringify(summary, null, 2));
}
