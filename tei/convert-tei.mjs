// SPDX-License-Identifier: 0BSD
// Maintainer: poplolioi11 (一卦 yigua.art), https://github.com/poplolioi11
// Deterministic format conversion only; no new scan collation.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ENCODING_VERSION = '0.1.0';
export const ENCODING_DATE = '2026-10-11';
export const SOURCE_COMMIT = '3c8e0309e30b2263d94c164e135c7e69cc415b7f';
export const SOURCE_JSON_SHA256 = '184d9b6fdeb2fbce08384b917e42d2ce75b74c46210a69496870476d6f53a732';
export const SOURCE_TXT_SHA256 = '1a52a95326505e1bd932ab04465f7c31b9f357e2ea290726c913c9a1e10827db';
export const TEI_SCHEMA_URL = 'https://www.tei-c.org/Vault/P5/4.12.0/xml/tei/custom/schema/relaxng/tei_all.rng';
export const TEI_SCHEMA_SHA256 = 'b0f115095ead2ccc6933aa3365c6f4a82cba3b2ec7eee7f76bb616d7a63b7e48';
export const FOREIGN_NAMESPACE = 'https://yigua.art/ns/source-metadata/1.0';
export const sha256 = value => createHash('sha256').update(value).digest('hex');

export function validateDoiRecord(record) {
  if (record === undefined || record === null) return null;
  assert.match(record.doi ?? '', /^10\.5281\/zenodo\.[1-9][0-9]*$/u, 'expected an externally verified Zenodo DOI, never a placeholder');
  assert.ok(['reserved', 'published'].includes(record.status), 'DOI state must be explicit: reserved or published');
  assert.match(record.statusCheckedAt ?? '', /^\d{4}-\d{2}-\d{2}$/u, 'DOI state needs an explicit check date');
  return { doi: record.doi, status: record.status, statusCheckedAt: record.statusCheckedAt };
}

export async function loadReleaseOptions() {
  try {
    return JSON.parse(await readFile(new URL('./TEI-RELEASE.json', import.meta.url), 'utf8'));
  } catch (error) {
    if (error.code === 'ENOENT') return {};
    throw error;
  }
}

export function escapeXml(value) {
  return String(value).replace(/[&<>"']/gu, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;',
  }[character]));
}

export function validateSource(sourceBytes) {
  assert.equal(sha256(sourceBytes), SOURCE_JSON_SHA256, 'source JSON is not the frozen corpus identified by this encoding');
  const dataset = JSON.parse(sourceBytes.toString('utf8'));
  assert.equal(dataset.hexagrams.length, 64, 'expected 64 source hexagrams');
  let ordinary = 0;
  let special = 0;
  for (const [index, hexagram] of dataset.hexagrams.entries()) {
    assert.equal(hexagram.number, index + 1, 'source hexagram order changed');
    assert.equal(hexagram.lines.length, 6, 'expected six ordinary lines per hexagram');
    assert.equal(hexagram.lineSources.length, 6, 'expected six ordinary line sources per hexagram');
    assert.equal(hexagram.status, 'scan-reviewed', 'existing source status changed');
    ordinary += hexagram.lines.length;
    if (hexagram.special) {
      assert.ok(hexagram.number === 1 || hexagram.number === 2, 'unexpected special statement');
      special += 1;
    }
  }
  assert.equal(ordinary, 384);
  assert.equal(special, 2);
  return dataset;
}

export function convertTei(sourceBytes, { doiRecord } = {}) {
  const dataset = validateSource(sourceBytes);
  const doi = validateDoiRecord(doiRecord);
  const e = escapeXml;
  const doiIdentifier = doi ? `\n        <idno type="DOI">${e(doi.doi)}</idno>` : '';
  const doiNote = !doi
    ? '本 TEI 編碼未記入已取得的 DOI；不得將格式編碼版本、來源提交或預留識別碼當作已發布 DOI。'
    : doi.status === 'reserved'
      ? `截至 ${doi.statusCheckedAt} TEI 編碼準備查核，Zenodo 草稿已預留 ${doi.doi}；當次查核尚未發布。預留識別碼不等於正式發布；後續發布狀態應以 Zenodo 記錄為準。`
      : `截至 ${doi.statusCheckedAt} 查核，Zenodo 記錄已發布並使用 ${doi.doi}；後續版本與記錄狀態應以 Zenodo 記錄為準。`;
  const sourceJson = sourceBytes.toString('utf8');
  const fixedJsonUrl = `${dataset.meta.projectUrl}/blob/${SOURCE_COMMIT}/wuying-lines.json`;
  const divisions = dataset.hexagrams.map(hexagram => {
    const id = `h${String(hexagram.number).padStart(2, '0')}`;
    const sourceId = hexagram.number === 20 ? 'source-meiji' : 'source-harvard';
    const lines = hexagram.lines.map((line, index) =>
      `        <ab xml:id="${id}-l${index + 1}" type="ordinary" n="${index + 1}" facs="${e(hexagram.lineSources[index])}">${e(line)}</ab>`);
    if (hexagram.special) {
      lines.push(`        <ab xml:id="${id}-special" type="special" n="${e(hexagram.special.label)}">${e(hexagram.special.label)}：${e(hexagram.special.text)}</ab>`);
      lines.push(`        <note type="special-source-gap" corresp="#${id}-special">來源 JSON 未附${e(hexagram.special.label)}各自獨立的原頁來源；不將六條普通爻辭的 lineSources 自動當成此則用辭的獨立證據。</note>`);
    }
    if (hexagram.sourceNote !== undefined) {
      lines.push(`        <note type="sourceNote">${e(hexagram.sourceNote)}</note>`);
    }
    return [
      `      <div xml:id="${id}" type="hexagram" n="${hexagram.number}" corresp="#${sourceId}">`,
      `        <head>${e(hexagram.name)}</head>`,
      `        <note type="existing-review-status">${e(hexagram.status)}</note>`,
      `        <note type="source"><ref target="${e(hexagram.sourceUrl)}">${e(hexagram.source)}</ref></note>`,
      ...lines,
      '      </div>',
    ].join('\n');
  }).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<?xml-model href="${TEI_SCHEMA_URL}" type="application/xml" schematypens="http://relaxng.org/ns/structure/1.0"?>
<TEI xmlns="http://www.tei-c.org/ns/1.0" xml:lang="zh-Hant" xml:id="wuying-lines-tei">
  <teiHeader>
    <fileDesc>
      <titleStmt>
        <title>${e(dataset.meta.title)}：TEI 編碼 ${ENCODING_VERSION}</title>
        <respStmt>
          <resp>既有爻辭資料的轉錄、整理與維護署名；不是古籍作者署名</resp>
          <name ref="${e(dataset.meta.creatorUrl)}">${e(dataset.meta.preparedBy)}</name>
        </respStmt>
        <respStmt>
          <resp>既有資料保留的專案署名；實際工作為原刻影像轉錄與整理，非新翻譯</resp>
          <name>${e(dataset.meta.attribution)}</name>
        </respStmt>
      </titleStmt>
      <editionStmt>
        <edition n="${ENCODING_VERSION}">TEI 格式編碼版本 ${ENCODING_VERSION}；來源資料版本另以 Git 提交識別碼與 SHA-256 識別。</edition>
      </editionStmt>
      <extent>
        <measure unit="hexagram" quantity="64">64 卦</measure>
        <measure unit="ordinary-line-statement" quantity="384">384 條普通爻辭</measure>
        <measure unit="special-statement" quantity="2">用九、用六共 2 則</measure>
      </extent>
      <publicationStmt>
        <publisher>${e(dataset.meta.preparedBy)}</publisher>
        <date when="${ENCODING_DATE}">${ENCODING_DATE}</date>
        <idno type="URI">${e(dataset.meta.projectUrl)}</idno>
        <idno type="source-git-commit">${SOURCE_COMMIT}</idno>
        <idno type="source-json-sha256">${SOURCE_JSON_SHA256}</idno>
        <idno type="source-txt-sha256">${SOURCE_TXT_SHA256}</idno>${doiIdentifier}
        <availability status="free">
          <p>古籍原文屬公有領域，不因轉錄、整理、TEI 編碼或 AI 輔助而新增限制。請求保留 ${e(dataset.meta.attribution)}、底本與逐爻影像來源；此請求不是古籍原文的使用條件。</p>
          <p>達到著作權保護門檻的原創說明採 <ref target="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</ref>；完整權利範圍見來源庫 <ref target="${e(dataset.meta.projectUrl)}/blob/${SOURCE_COMMIT}/LICENSE.md">LICENSE.md</ref>。館藏影像沒有打包於本資料集，第三方影像政策與其他獨立權利仍須另查。</p>
        </availability>
      </publicationStmt>
      <notesStmt>
        <note type="scope">${e(dataset.meta.scope)}</note>
        <note type="existing-review">${e(dataset.meta.review)}</note>
        <note type="source-export-date">${e(dataset.meta.exportedAt)}</note>
        <note type="source-metadata-date">${e(dataset.meta.metadataUpdatedAt)}</note>
        <note type="doi-status">${e(doiNote)}</note>
      </notesStmt>
      <sourceDesc>
        <listBibl>
          <bibl xml:id="source-dataset">
            <title>${e(dataset.meta.title)}</title>
            <ref target="${e(fixedJsonUrl)}">本次格式轉換所用固定提交 JSON</ref>
            <note>${e(dataset.meta.sourceNote)}</note>
          </bibl>
          <bibl xml:id="source-harvard">
            <title>《御纂周易折中》康熙五十四年（1715）武英殿刊本，哈佛燕京圖書館藏本</title>
            <date when="1715">1715</date>
            <idno type="holding">T2354494</idno>
            <ref target="https://id.lib.harvard.edu/alma/990079179900203941/catalog">館藏書目</ref>
            <ref target="https://nrs.lib.harvard.edu/URN-3:FHCL:4142005:VIEW">原刻影像入口</ref>
            <note>第 1–19、21–64 卦的普通爻辭來源；古籍責任者權威記錄尚未由本資料集獨立整理，不另補作者。</note>
          </bibl>
          <bibl xml:id="source-meiji">
            <title>《御纂周易折中》康熙五十四年（1715）武英殿刊本，明治大學圖書館藏本</title>
            <date when="1715">1715</date>
            <idno type="holding">LI00000554</idno>
            <ref target="https://m-archives.meiji.jp/content/detail/LI00000554">館藏書目及影像</ref>
            <note>僅第 20 觀卦；同版別不等於已證明同一次印刷，更換藏本原因未見於既有紀錄。</note>
          </bibl>
        </listBibl>
      </sourceDesc>
    </fileDesc>
    <encodingDesc>
      <projectDesc>
        <p>將固定版本 JSON 轉為 TEI P5 閱讀結構，並保留完整來源 JSON metadata。這是格式轉換，沒有重新核對全部原刻影像，不新增獨立校勘或人工雙校主張。</p>
      </projectDesc>
      <editorialDecl>
        <normalization>
          <p>64 個 hexagram div 保留原卦序；每個 ordinary ab 的完整文字與來源 JSON lines 字串相同，包含原本全形冒號。冒號為爻位與正文的欄位分隔，不是新增古籍句讀。不作 Unicode 正規化、簡繁轉換、異體字替換、補標點或補文。special ab 以來源 label、全形冒號與 text 組合，與既有 TXT 閱讀字串相同。</p>
        </normalization>
        <interpretation>
          <p>ordinary ab 的 facs 原樣保存對應 lineSources 網址，沒有新增影像座標、surface 或 zone。用九、用六未附獨立原頁來源，special ab 不設 facs。sourceNote 與來源狀態存於 note，屬資料說明而非古籍正文；scan-reviewed 僅沿用既有紀錄，不是無誤保證、第三方認證或新的影像校對。</p>
          <p>xenoData 內非 TEI 命名空間 ${FOREIGN_NAMESPACE} 的 json 保存來源 JSON 原字串，供完整 metadata 回讀；它不是閱讀正文，也不是另一本古籍。TEI_all 一般 schema 驗證不能證明逐字讀法、影像可用性或校勘完備性。本編碼未提供專屬 TEI ODD 或完整校勘 apparatus。</p>
        </interpretation>
      </editorialDecl>
    </encodingDesc>
    <profileDesc>
      <langUsage>
        <language ident="lzh-Hant">古典漢語爻辭，保留來源可編碼用字</language>
        <language ident="zh-Hant">資料說明</language>
      </langUsage>
    </profileDesc>
    <xenoData>
      <json xmlns="${FOREIGN_NAMESPACE}" mimeType="application/json" xml:space="preserve">${e(sourceJson)}</json>
    </xenoData>
    <revisionDesc>
      <change when="${ENCODING_DATE}">建立 TEI 格式編碼 ${ENCODING_VERSION}；保留來源匯出日期、metadata 日期與既有校對限制。沒有執行新一輪原刻影像全校。</change>
    </revisionDesc>
  </teiHeader>
  <text xml:lang="lzh-Hant">
    <body>
${divisions}
    </body>
  </text>
</TEI>
`;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const sourcePath = resolve(process.argv[2] ?? fileURLToPath(new URL('../wuying-lines.json', import.meta.url)));
  const outputPath = resolve(process.argv[3] ?? fileURLToPath(new URL('./wuying-lines.tei.xml', import.meta.url)));
  const options = process.argv[4]
    ? { doiRecord: { doi: process.argv[4], status: process.argv[5], statusCheckedAt: process.argv[6] } }
    : await loadReleaseOptions();
  const xml = convertTei(await readFile(sourcePath), options);
  await writeFile(outputPath, xml, 'utf8');
  console.log(JSON.stringify({ outputPath, encodingVersion: ENCODING_VERSION, sourceCommit: SOURCE_COMMIT, teiSha256: sha256(xml) }, null, 2));
}
