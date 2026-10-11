# 武英殿本《周易》爻辭資料｜易經・I Ching・Yijing

一卦（[yigua.art](https://yigua.art/)）公開的《御纂周易折中》康熙五十四年（1715）武英殿刊本爻辭轉錄資料。包含六十四卦的 **384 條爻辭，以及乾「用九」、坤「用六」**；不含卦辭、注解或全書。這是可下載、可核對的資料集，不是網站原始碼。

資料署名保留為 **yigua.art網站轉譯**；實際工作是古籍影像的轉錄、整理與既有校對，不是新翻譯。古籍原文可自由使用、商用及改作；請求重用者保留底本、來源連結及這項署名，但不以此限制公有領域原文的使用。本站具有原創性的說明文字另採 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)。完整範圍見 [LICENSE.md](LICENSE.md)。

整理者與維護者：**一卦 yigua.art / [poplolioi11](https://github.com/poplolioi11)**。此署名指本資料集的轉錄、整理與維護，不是古籍作者，也不代表館藏機構。

## 🌌 創作者宣言 / Creator's Statement

本專案的誕生，得益於無數前人留下的文化資產，以及現代 AI 技術的協助。在數位與 AI 交織的時代，沒有任何創意是孤立存在的。

我不尋求將此專案商業變現。我的核心願景是：**「讓我的創意與勞動，成為他人創意的墊腳石。」** 正如我站在前人的肩膀上一樣，我衷心希望這份結構化的開源資料，能成為你創新、研究或二次創作的起點。

如果您在您的研究、App、或任何專案中引用了本庫受 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權的原創說明，請依該條款標示來源。古籍原文屬公有領域，可自由使用；對於這部分，我也誠摯邀請您保留「yigua.art網站轉譯 / poplolioi11」署名，或自願透過 [Issues](https://github.com/poplolioi11/yigua-wuyingdian-lines/issues) 分享您的成果，但這不是使用條件。這能讓我看到這份瘋狂的熱情在世界上留下了什麼樣的痕跡。謝謝你，與我共同編織這個時代的文化記憶。

## 下載與使用

- [wuying-lines.json](wuying-lines.json)：包含卦號、卦名、六條爻辭、逐爻影像網址及來源資訊。
- [wuying-lines.txt](wuying-lines.txt)：方便直接閱讀的文字版。
- [TEI P5 XML](tei/wuying-lines.tei.xml)：保留原文字串、逐爻來源及來源 JSON 快照；[編碼與驗證說明](tei/README-TEI.md)。
- [PROVENANCE.md](PROVENANCE.md)：底本、既有校對紀錄與未解決的來源缺口。
- [SHA256SUMS](SHA256SUMS)：兩份資料檔的 SHA-256 校驗值。

JSON 的 `hexagrams` 按文王卦序排列；每卦的 `lines` 與 `lineSources` 均由初爻到上爻一一對應。`special` 只出現在乾、坤，分別收用九、用六。爻位後的全形冒號是資料欄位分隔，不是為原典新增句讀。原刻的「无」「羣」「牀」等用字保留，不做全域簡繁轉換。

### 格式、欄位與覆蓋範圍

兩份檔案均為 UTF-8 文字。JSON 以 `meta` 保存整理資訊，以 `hexagrams` 保存六十四卦記錄；TXT 是同一份資料的閱讀用匯出，不是另一底本。主要欄位如下；這是欄位說明，**不是完整 JSON Schema 或 TEI schema**。

| 欄位 | 語意與使用限制 |
| --- | --- |
| `meta.scope` | 公開範圍：384 條普通爻辭及用九、用六，不含卦辭、注解、傳文或全書。 |
| `meta.attribution`、`preparedBy`、`githubAccount` | 本資料整理署名及維護帳號；不是古籍作者或館藏權利人的姓名。 |
| `meta.exportedAt` | 既有資料匯出日期，不能當作全部影像重新校對日期。 |
| `hexagrams[].number`、`name` | 文王卦序 1–64 及卦名；陣列索引與卦號不要混淆。 |
| `hexagrams[].lines` | 六個字串，由初爻至上爻排列；每條含原文爻位標題及全形冒號。 |
| `hexagrams[].lineSources` | 六個原頁網址，與 `lines` 同索引對應；不涵蓋兩則 `special` 的獨立原頁證據。 |
| `hexagrams[].sourceUrl` | 藏本或影像入口，不等同每條文字的獨立頁碼。 |
| `hexagrams[].status` | 既有 `scan-reviewed` 紀錄標籤，不是無誤保證或第三方認證。 |
| `hexagrams[].special` | 僅乾、坤使用的 `{ label, text }`，分別保存用九、用六。 |
| `hexagrams[].sourceNote` | 有記錄時保存來源限制，例如損卦上九印墨缺損及旁證；不是古籍正文。 |

發行包 **0.1.0** 新增 TEI P5 4.12.0 XML，以官方 Relax NG schema 與專案一致性檢查驗證；原 JSON／TXT 位元內容未改。TEI 可無損回讀原文字串、逐爻來源及完整來源 JSON。沒有製作專屬 ODD、正式 JSON Schema、完整校勘 apparatus 或逐字影像座標；不打包館藏影像。格式通過不能證明古籍文字正確，也不代表全書數位校勘完成。詳見 [TEI 說明](tei/README-TEI.md)。

可用 Node.js 18 或更新版本執行不需要安裝套件的資料檢查：

```sh
node verify.mjs
```

這項檢查只驗證資料結構、JSON/TXT 一致性、來源網址形式及既有檔案校驗值；**不替代對原刻影像的逐字校對，也不保證外部網址永遠可用**。

### 可重現的版本與完整性

本庫以 **資料版本、Git 提交識別碼及檔案 SHA-256** 識別所用內容，不以網站版本號代替資料版本。公開庫首次建立於 2026-10-10；加入 TEI 的 0.1.0 發行包準備於 2026-10-11；古籍資料原匯出日期為 2026-10-07。這些日期不能作為新的全校完成日期。Zenodo 識別碼為 [10.5281/zenodo.23298982](https://doi.org/10.5281/zenodo.23298982)，公開與登記狀態以 Zenodo 記錄為準；製備時 XML 註記的 reserved 是當次查核狀態，不是逐字校對認證。

目前兩份資料檔的固定校驗值為：

```text
184d9b6fdeb2fbce08384b917e42d2ce75b74c46210a69496870476d6f53a732  wuying-lines.json
1a52a95326505e1bd932ab04465f7c31b9f357e2ea290726c913c9a1e10827db  wuying-lines.txt
```

研究或二次整理時，請保留所用檔案、提交識別碼及其 `SHA256SUMS`。已下載儲存庫的使用者，可在庫內執行：

```sh
git rev-parse HEAD
node verify.mjs
```

引用連結宜用 `https://github.com/poplolioi11/yigua-wuyingdian-lines/blob/<完整提交識別碼>/wuying-lines.json` 這類固定提交網址，將 `<完整提交識別碼>` 換成你實際使用的值；`main` 會隨修正而改變。只下載單一檔案時，至少記錄檔名、SHA-256、下載網址及取用日期。校驗成功只表示取得預期位元內容，不能證明每字讀法正確。

## 引用與共同維護

根目錄的 [CITATION.cff](CITATION.cff) 提供機器可讀的資料集引用資訊，使用公開帳號 `poplolioi11` 署名，不公開真實姓名或私人信箱。GitHub 的「Cite this repository」入口可取得 APA 與 BibTeX 格式；引用特定資料時，請另記錄所用提交識別碼或檔案 SHA-256，便於追溯。

建議引用：**poplolioi11（一卦 yigua.art）。《御纂周易折中》武英殿刊本·六十四卦爻辭［資料集］。2026。https://github.com/poplolioi11/yigua-wuyingdian-lines**

### 分開引用資料集、古籍與館藏

三種引用各自回答不同問題，不能以整理者帳號取代古籍作者，也不能把館藏機構列作本資料集作者。請依投稿或學科規範調整格式，並保留以下可追溯資訊：

1. **資料集／轉錄整理**：引用上列 `poplolioi11（一卦 yigua.art）` 的資料集資訊，補上實際所用完整提交識別碼、檔案校驗值及取用日期。這說明你使用哪份數位整理，不表示整理者撰寫古籍。
2. **古籍／版別**：可記為「《御纂周易折中》。康熙五十四年（1715）北京武英殿刊本」，引文另列卦名、爻位及可核實的卷葉。編纂或校刊責任者請依實際引用的館藏書目及原書題署核實；本庫尚未獨立整理責任者權威記錄，不在此另憑記憶補寫作者。不要將本庫爻辭節錄引用成《御纂周易折中》全書。
3. **館藏／原刻影像**：依實際條目引用哈佛燕京圖書館藏本（T2354494）或明治大學圖書館藏本（LI00000554），列原頁網址、影像識別碼或卷葉及取用日期；入口見下方「底本與可追溯性」。觀卦須註明使用明治藏本，不能統稱全庫都取自哈佛。用九、用六尚欠獨立頁碼，不應代填未核實頁碼。

若逐字引用或提出異文，建議同時提供「數位資料版本」與「古籍原頁」，讓讀者能區分轉錄結果與底本證據。發布後若自行改字、加標點、轉換字形或合併其他文本，請另述處理方法，勿把改後文字仍標成未改動的本站匯出。

- [Issues：提出校對疑義、使用問題或自願分享引用成果](https://github.com/poplolioi11/yigua-wuyingdian-lines/issues)。回報格式見 [CONTRIBUTING.md](CONTRIBUTING.md)，不必提供個人資料。
- [Pull requests：提交有來源證據的修正](https://github.com/poplolioi11/yigua-wuyingdian-lines/pulls)。修正由維護者審閱，不會自動改動正文。

`CITATION.cff` 是引用資訊，不是引用追蹤服務，不會通知維護者每次下載或外部引用。Issues 中自願告知的用途、公開 fork 與引用連結只能反映可觀察到的部分，不能當成完整使用人數；本庫不加入使用者追蹤程式。古籍原文的自由使用不以告知維護者或引用本庫為條件。

## 底本與可追溯性

- 第 1–19、21–64 卦：哈佛燕京圖書館藏武英殿刊本，館藏號 T2354494。[館藏書目](https://id.lib.harvard.edu/alma/990079179900203941/catalog)、[原刻影像](https://nrs.lib.harvard.edu/URN-3:FHCL:4142005:VIEW)。
- 第 20 觀卦：明治大學圖書館同版別藏本，書目載北京武英殿、康熈 54 年（1715）。[館藏書目及影像](https://m-archives.meiji.jp/content/detail/LI00000554)。**同版別不等於已證明同一次印刷；更換藏本的原因未見於既有紀錄。**

384 條普通爻辭的原頁網址保存在 JSON 中；用九、用六尚欠獨立頁碼證據，未代填。此資料庫不下載、打包或重新散布館藏掃描影像，也不使用館方標誌或暗示館方背書。

哈佛的[公有領域數位重製開放政策](https://library.harvard.edu/about/policies/policy-access-digital-reproductions-works-public-domain)允許符合政策的開放公有領域影像無需另付費或申請許可即再利用，並請求妥善引用館藏。明治的[利用指南](https://m-archives.meiji.jp/guide)說明 PDM 資料可免費用於商用及非商用用途，要求註明館藏出處及改動，並請求寄贈利用成果。本庫記錄轉錄行為與來源，尚未寄贈成果；不代表所有館藏資料都採相同條件。

## 校對狀態與限制

沿用一卦既有的 `scan-reviewed` 逐爻影像紀錄，原紀錄完成日期為 2026-10-01；兩份資料匯出於 2026-10-07。本次建立公開資料庫**沒有重新進行全部 384 爻的第二輪影像校對**，狀態名稱不是第三方認證，也不保證完全無誤。

- 本專案的創作者宣言記錄 AI 技術的協助；本庫沒有逐條保存所有原始 OCR／模型輸出、模型版本與每次人工覆核紀錄，不能由 `scan-reviewed` 還原完整工作歷程，也不能宣稱每筆均經獨立人工雙校。學術使用者仍須依逐爻原頁核對關鍵引文；AI 記憶或其他網路通行文字不能取代原刻證據。
- 損卦上九的大字中段印墨缺損。既有紀錄以同頁程傳逐句引文及次頁集說引文核對缺損文字；JSON 保留 `sourceNote`，不能宣稱大字原頁完全清楚。
- 用九、用六已有文本，但此 JSON 尚未附兩則文字各自的獨立頁碼來源；只有乾、坤及全書影像入口。這是待補足的證據缺口，不能宣稱逐條來源欄位已涵蓋它們。
- 可編碼的異體字不等於摹刻。檔案不重現原刻全部排印字形、墨跡或圈點，也不自行改為現代通行字、補標點或刪字。
- 此處發布的是爻辭範圍，不能據此推定一卦其他卦辭、注解或外語版本已採相同底本或完成相同校對。

## 與既有資料的關係

已有他人公開《御纂周易折中》的全文整理，例如 [CnPeng/AncientChineseBook 的全文檔案](https://github.com/CnPeng/AncientChineseBook/blob/master/01%E6%98%93%E8%97%8F-0195%E9%83%A8/01%E6%98%93%E7%BB%8F-49%E9%83%A8/%E5%BE%A1%E7%BA%82%E5%91%A8%E6%98%93%E6%8A%98%E4%B8%AD-%E6%B8%85-%E6%9D%8E%E5%85%89%E5%9C%B0.txt)。它是相關整理工作的例子，**不是本資料集的取文底本**。本庫不主張首度數位化、不宣稱獨占古籍文字，也未比較兩者全文的準確率。

本庫的用途在於提供範圍明確的結構化爻辭、逐爻影像連結、用字保留、校勘限制及可驗證匯出檔，供研究、應用與後續校對使用。歡迎依 [CONTRIBUTING.md](CONTRIBUTING.md) 提出有影像證據的修正。

## English summary

This structured I Ching (Yijing / Zhouyi) dataset contains the 384 line statements (yaoci) of the 64 hexagrams and the two special statements, *Yong Jiu* and *Yong Liu*, transcribed from the 1715 Wuyingdian edition of *Yuzuan Zhouyi Zhezhong*. JSON and TXT files are provided for reading, research, and reuse. It does not include hexagram judgments, commentaries, the full book, scan images, or the private yigua website source code.

Most line-image references point to the Harvard-Yenching Library copy; hexagram 20 uses the Meiji University Library copy of the same edition, not a proven identical print run. The records are existing yigua exports, not a new complete second collation. Separate page citations for the two special statements remain to be added. See [PROVENANCE.md](PROVENANCE.md) for the damaged-print note and other limitations.

The ancient public-domain text may be used, adapted, and used commercially without a new restriction from this transcription. Attribution to **yigua.art網站轉譯** (image transcription and preparation, not a new translation) is requested, not imposed on the public-domain text. The dataset is prepared and maintained by **poplolioi11 (一卦 yigua.art)**. Copyright-protected original documentation is licensed under CC BY 4.0. `node verify.mjs` checks file integrity and structure, not philological correctness.

[CITATION.cff](CITATION.cff) provides dataset citation metadata, not automatic usage or citation tracking. Corrections and optional reports of reuse are welcome through [Issues](https://github.com/poplolioi11/yigua-wuyingdian-lines/issues); evidence-based changes may be submitted through pull requests. Reuse of the public-domain text does not require reporting it to the maintainer.

For scholarly use, cite the versioned digital dataset, the historical edition, and the holding institution or page image separately. Package 0.1.0 adds TEI P5 XML, validated against the official 4.12.0 Relax NG schema and lossless source comparisons, without changing the original UTF-8 JSON/TXT. DOI: https://doi.org/10.5281/zenodo.23298982 (publication and registration status are authoritative on Zenodo). No custom ODD, complete critical apparatus, formal JSON Schema or independent double collation is claimed. XML validity and a DOI are not scholarly quality certifications; verify consequential readings against the scans and report uncertainty with page-level evidence.
