// SPDX-License-Identifier: 0BSD
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { convertTei, escapeXml, SOURCE_JSON_SHA256, sha256, loadReleaseOptions, validateDoiRecord } from './convert-tei.mjs';
import { verifyXml, verifyText, parseXml, validateRelaxNg } from './verify-tei.mjs';

const directory = process.env.WUYING_SOURCE_DIR ?? fileURLToPath(new URL('../', import.meta.url));
const [sourceBytes, txtBytes, checkedXml] = await Promise.all([
  readFile(resolve(directory, 'wuying-lines.json')),
  readFile(resolve(directory, 'wuying-lines.txt')),
  readFile(new URL('./wuying-lines.tei.xml', import.meta.url), 'utf8'),
]);
const options = await loadReleaseOptions();
const xml = convertTei(sourceBytes, options);

test('frozen source SHA-256 and deterministic generated artifact', () => {
  assert.equal(sha256(sourceBytes), SOURCE_JSON_SHA256);
  assert.equal(convertTei(sourceBytes, options), xml);
  assert.equal(checkedXml, xml);
  assert.equal(sha256(checkedXml), '72cfc821d6b3677809bd66e03bf555bb5bc4004bf49724902dc647a6fffbc595', 'published-package candidate XML bytes changed');
});

test('independent XML parser reconstructs all original text and record fields', () => {
  const summary = verifyXml(xml, sourceBytes, options);
  assert.equal(summary.hexagrams, 64);
  assert.equal(summary.ordinaryLineStatements, 384);
  assert.equal(summary.specialStatements, 2);
  assert.equal(summary.uniqueXmlIds, 454);
});

test('all 64 TEI reading/source blocks match frozen TXT', () => {
  assert.equal(verifyText(xml, sourceBytes, txtBytes).exactTxtHexagramBlocks, 64);
});

const mutations = [
  ['changed ancient character', '<ab xml:id="h01-l1" type="ordinary" n="1" facs="https://nrs.harvard.edu/URN-3:FHCL:4142005:VIEW?page=16765411">初九：潛龍勿用</ab>', '<ab xml:id="h01-l1" type="ordinary" n="1" facs="https://nrs.harvard.edu/URN-3:FHCL:4142005:VIEW?page=16765411">初九：潜龍勿用</ab>'],
  ['lost original colon separator', '>初九：潛龍勿用</ab>', '>初九潛龍勿用</ab>'],
  ['changed ordinary line source', 'facs="https://nrs.harvard.edu/URN-3:FHCL:4142005:VIEW?page=16765411"', 'facs="https://nrs.harvard.edu/URN-3:FHCL:4142005:VIEW?page=999"'],
  ['changed sourceUrl', '<ref target="https://nrs.lib.harvard.edu/URN-3:FHCL:4142005:VIEW">《御纂周易折中》康熙五十四年武英殿刊本（1715）</ref>', '<ref target="https://example.org/incorrect">《御纂周易折中》康熙五十四年武英殿刊本（1715）</ref>'],
  ['changed existing status', '<note type="existing-review-status">scan-reviewed</note>', '<note type="existing-review-status">independently-collated</note>'],
  ['swapped Meiji holding', 'xml:id="h20" type="hexagram" n="20" corresp="#source-meiji"', 'xml:id="h20" type="hexagram" n="20" corresp="#source-harvard"'],
  ['invented special facs', '<ab xml:id="h01-special" type="special" n="用九">', '<ab xml:id="h01-special" type="special" n="用九" facs="https://example.org/invented-page">'],
  ['changed special text', '>用九：見羣龍无首吉</ab>', '>用九：見群龍無首吉</ab>'],
  ['duplicate XML id', 'xml:id="h02-l1"', 'xml:id="h01-l1"'],
  ['changed damaged-print note', '<note type="sourceNote">上九大字中段印墨缺損；', '<note type="sourceNote">上九大字完全清晰；'],
  ['changed embedded metadata', '&quot;metadataUpdatedAt&quot;: &quot;2026-10-10&quot;', '&quot;metadataUpdatedAt&quot;: &quot;2026-10-11&quot;'],
  ['changed ordinary line order', 'xml:id="h01-l1" type="ordinary" n="1"', 'xml:id="h01-l1" type="ordinary" n="2"'],
];

for (const [label, before, after] of mutations) {
  test(`verifier rejects ${label}`, () => {
    assert.ok(xml.includes(before), `mutation fixture absent: ${label}`);
    assert.throws(() => verifyXml(xml.replace(before, after), sourceBytes, options));
  });
}

test('converter rejects changed source bytes instead of silently assigning frozen provenance', () => {
  assert.throws(() => convertTei(Buffer.from(sourceBytes.toString('utf8').replace('潛龍勿用', '潜龍勿用'), 'utf8')));
});

test('XML escaping preserves text on a standards parser round-trip', () => {
  assert.equal(escapeXml('&<>"\''), '&amp;&lt;&gt;&quot;&apos;');
  const scope = JSON.parse(sourceBytes).meta.scope;
  const escapedFixture = xml.replace(`<note type="scope">${scope}</note>`, `<note type="scope">${escapeXml('&<>"\'')}</note>`);
  assert.equal(parseXml(escapedFixture).headerNotes.find(note => note.type === 'scope').text, '&<>"\'');
});

test('recorded DOI and dated publication caveat are preserved', () => {
  const summary = verifyXml(xml, sourceBytes, options);
  assert.deepEqual(summary.doiRecord, options.doiRecord);
});

test('DOI syntax, explicit state and check date are required', () => {
  assert.throws(() => validateDoiRecord({ doi: 'DOI-PENDING', status: 'reserved', statusCheckedAt: '2026-10-11' }));
  assert.throws(() => validateDoiRecord({ doi: options.doiRecord.doi }));
  assert.throws(() => validateDoiRecord({ doi: options.doiRecord.doi, status: 'reserved' }));
});

test('verifier rejects reserved DOI represented as published', () => {
  const reservedOptions = { doiRecord: { ...options.doiRecord, status: 'reserved' } };
  const reservedXml = convertTei(sourceBytes, reservedOptions);
  assert.throws(() => verifyXml(reservedXml.replace('當次查核尚未發布', '記錄已發布'), sourceBytes, reservedOptions));
});

test('official pinned external TEI schema validates the artifact', { skip: !process.env.TEI_SCHEMA_PATH }, () => {
  const summary = validateRelaxNg(fileURLToPath(new URL('./wuying-lines.tei.xml', import.meta.url)), resolve(process.env.TEI_SCHEMA_PATH));
  assert.equal(summary.status, 'passed');
});
