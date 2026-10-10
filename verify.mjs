// SPDX-License-Identifier: 0BSD
// Maintainer: poplolioi11 (一卦 yigua.art), https://github.com/poplolioi11
// Structure and integrity checks only; not a replacement for scan collation.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';

const expectedHashes = new Map([
  ['wuying-lines.json', '184d9b6fdeb2fbce08384b917e42d2ce75b74c46210a69496870476d6f53a732'],
  ['wuying-lines.txt', '1a52a95326505e1bd932ab04465f7c31b9f357e2ea290726c913c9a1e10827db'],
]);
const directory = new URL('./', import.meta.url);
const contents = new Map();
for (const [file, expected] of expectedHashes) {
  const bytes = await readFile(new URL(file, directory));
  assert.equal(createHash('sha256').update(bytes).digest('hex'), expected, `${file}: SHA-256 mismatch`);
  contents.set(file, bytes.toString('utf8'));
}

const checksumLines = (await readFile(new URL('SHA256SUMS', directory), 'utf8')).trim().split(/\r?\n/u);
assert.equal(checksumLines.length, expectedHashes.size, 'SHA256SUMS: unexpected number of entries');
const checksumNames = new Set();
for (const row of checksumLines) {
  const match = /^([a-f0-9]{64}) {2}([\w.-]+)$/u.exec(row);
  assert.ok(match, 'SHA256SUMS: malformed entry');
  assert.ok(!checksumNames.has(match[2]), 'SHA256SUMS: duplicate entry');
  checksumNames.add(match[2]);
  assert.equal(match[1], expectedHashes.get(match[2]), `SHA256SUMS: unexpected hash for ${match[2]}`);
}

const dataset = JSON.parse(contents.get('wuying-lines.json'));
assert.equal(dataset.meta.attribution, 'yigua.art網站轉譯', 'project attribution mismatch');
assert.equal(dataset.meta.githubAccount, 'poplolioi11', 'public GitHub attribution mismatch');
assert.equal(dataset.meta.preparedBy, '一卦 yigua.art / poplolioi11', 'preparer attribution mismatch');
assert.equal(dataset.meta.creatorUrl, 'https://github.com/poplolioi11', 'creator profile mismatch');
assert.equal(dataset.meta.projectUrl, 'https://github.com/poplolioi11/yigua-wuyingdian-lines', 'project link mismatch');
assert.equal(dataset.meta.exportedAt, '2026-10-07', 'existing export date changed');
assert.ok(dataset.meta.scope.includes('384'), 'scope must record the 384 ordinary line statements');
assert.ok(dataset.meta.scope.includes('不含卦辭'), 'scope must exclude hexagram judgments');
assert.equal(dataset.hexagrams.length, 64, 'expected 64 hexagrams');

const positionLabels = [/^初[九六]：\S/u, /^[九六]二：\S/u, /^[九六]三：\S/u, /^[九六]四：\S/u, /^[九六]五：\S/u, /^上[九六]：\S/u];
const txt = contents.get('wuying-lines.txt');
assert.ok(txt.includes(`整理者：${dataset.meta.preparedBy}\n`), 'TXT preparer attribution mismatch');
assert.ok(txt.includes(`GitHub 帳號：${dataset.meta.creatorUrl}\n`), 'TXT creator profile mismatch');
assert.ok(txt.includes(`專案：${dataset.meta.projectUrl}\n`), 'TXT project link mismatch');

// Required-field consistency only, not a complete CFF schema validator.
const citation = await readFile(new URL('CITATION.cff', directory), 'utf8');
assert.match(citation, /^cff-version: 1\.2\.0$/mu, 'CFF version mismatch');
assert.match(citation, /^type: dataset$/mu, 'citation must identify a dataset');
assert.match(citation, /^title: "《御纂周易折中》武英殿刊本·六十四卦爻辭"$/mu, 'citation title mismatch');
assert.match(citation, /^  - family-names: "poplolioi11"$/mu, 'citation author attribution mismatch');
assert.match(citation, /^    website: "https:\/\/github\.com\/poplolioi11"$/mu, 'citation creator profile mismatch');
assert.match(citation, /^url: "https:\/\/github\.com\/poplolioi11\/yigua-wuyingdian-lines"$/mu, 'citation project link mismatch');
assert.match(citation, /^license-url: "https:\/\/github\.com\/poplolioi11\/yigua-wuyingdian-lines\/blob\/main\/LICENSE\.md"$/mu, 'citation license scope link mismatch');
let lineCount = 0;
let sourceCount = 0;
let specialCount = 0;
for (const [index, hexagram] of dataset.hexagrams.entries()) {
  assert.equal(hexagram.number, index + 1, `hexagram index ${index}: number/order mismatch`);
  assert.ok(typeof hexagram.name === 'string' && hexagram.name.trim(), `${hexagram.number}: missing name`);
  assert.equal(hexagram.status, 'scan-reviewed', `${hexagram.number}: existing status changed`);
  assert.equal(hexagram.lines.length, 6, `${hexagram.number}: expected 6 line statements`);
  assert.equal(hexagram.lineSources.length, 6, `${hexagram.number}: expected 6 image references`);
  assert.equal(new URL(hexagram.sourceUrl).protocol, 'https:', `${hexagram.number}: non-HTTPS edition reference`);
  for (const [position, line] of hexagram.lines.entries()) {
    assert.ok(positionLabels[position].test(line), `${hexagram.number}: unexpected label at position ${position + 1}`);
    const source = new URL(hexagram.lineSources[position]);
    assert.equal(source.protocol, 'https:', `${hexagram.number}: non-HTTPS line source`);
    if (hexagram.number === 20) {
      assert.equal(source.hostname, 'm-archives.meiji.jp', 'Guan must retain the Meiji copy references');
      assert.ok(source.pathname.includes('/LI00000554/'), 'Guan line image has an unexpected holding identifier');
    } else {
      assert.equal(source.hostname, 'nrs.harvard.edu', `${hexagram.number}: unexpected source institution`);
      assert.equal(source.pathname, '/URN-3:FHCL:4142005:VIEW', `${hexagram.number}: unexpected Harvard volume`);
      assert.match(source.searchParams.get('page') ?? '', /^\d+$/u, `${hexagram.number}: missing original page identifier`);
    }
    lineCount += 1;
    sourceCount += 1;
  }
  const block = [`${hexagram.number} ${hexagram.name}`, ...hexagram.lines];
  if (hexagram.special) {
    assert.ok(hexagram.number === 1 || hexagram.number === 2, 'special statement outside Qian/Kun');
    const expected = hexagram.number === 1
      ? { label: '用九', text: '見羣龍无首吉' }
      : { label: '用六', text: '利永貞' };
    assert.deepEqual(hexagram.special, expected, `${hexagram.number}: special statement mismatch`);
    block.push(`${hexagram.special.label}：${hexagram.special.text}`);
    specialCount += 1;
  } else {
    assert.ok(hexagram.number > 2, 'Qian/Kun special statement missing');
  }
  block.push(...hexagram.lineSources);
  assert.ok(txt.includes(block.join('\n')), `${hexagram.number}: JSON/TXT line content or source mismatch`);
}
assert.equal(lineCount, 384, 'expected 384 ordinary line statements');
assert.equal(sourceCount, 384, 'expected 384 ordinary line-image references');
assert.equal(specialCount, 2, 'expected Yong Jiu and Yong Liu');
assert.equal((txt.match(/^\d+ \S+$/gmu) ?? []).length, 64, 'TXT must contain exactly 64 numbered hexagram blocks');
assert.equal((txt.match(/^(?:初[九六]|[九六][二三四五]|上[九六])：/gmu) ?? []).length, 384, 'TXT ordinary line count mismatch');
assert.equal((txt.match(/^用[九六]：/gmu) ?? []).length, 2, 'TXT special statement count mismatch');
assert.ok(dataset.hexagrams[40].sourceNote.includes('印墨缺損'), 'Sun damaged-print limitation missing');
assert.ok(dataset.hexagrams[40].sourceNote.includes('16765652'), 'Sun corroborating next-page reference missing');

console.log(JSON.stringify({
  status: 'passed',
  hexagrams: dataset.hexagrams.length,
  ordinaryLineStatements: lineCount,
  ordinaryLineImageReferences: sourceCount,
  specialStatements: specialCount,
  fixedSha256Checks: expectedHashes.size,
  publicAttribution: dataset.meta.githubAccount,
  citationRequiredFields: 'passed (not full schema validation)',
  limitations: ['Special statements do not yet have independent page-source fields.', 'These checks do not verify scan transcription accuracy or external URL availability.'],
}, null, 2));
