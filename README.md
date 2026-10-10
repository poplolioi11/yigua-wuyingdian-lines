# 武英殿本《周易》爻辭資料｜易經・I Ching・Yijing

一卦（[yigua.art](https://yigua.art/)）公開的《御纂周易折中》康熙五十四年（1715）武英殿刊本爻辭轉錄資料。包含六十四卦的 **384 條爻辭，以及乾「用九」、坤「用六」**；不含卦辭、注解或全書。這是可下載、可核對的資料集，不是網站原始碼。

資料署名保留為 **yigua.art網站轉譯**；實際工作是古籍影像的轉錄、整理與既有校對，不是新翻譯。古籍原文可自由使用、商用及改作；請求重用者保留底本、來源連結及這項署名，但不以此限制公有領域原文的使用。本站具有原創性的說明文字另採 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)。完整範圍見 [LICENSE.md](LICENSE.md)。

## 下載與使用

- [wuying-lines.json](wuying-lines.json)：包含卦號、卦名、六條爻辭、逐爻影像網址及來源資訊。
- [wuying-lines.txt](wuying-lines.txt)：方便直接閱讀的文字版。
- [PROVENANCE.md](PROVENANCE.md)：底本、既有校對紀錄與未解決的來源缺口。
- [SHA256SUMS](SHA256SUMS)：兩份資料檔的 SHA-256 校驗值。

JSON 的 `hexagrams` 按文王卦序排列；每卦的 `lines` 與 `lineSources` 均由初爻到上爻一一對應。`special` 只出現在乾、坤，分別收用九、用六。爻位後的全形冒號是資料欄位分隔，不是為原典新增句讀。原刻的「无」「羣」「牀」等用字保留，不做全域簡繁轉換。

可用 Node.js 18 或更新版本執行不需要安裝套件的資料檢查：

```sh
node verify.mjs
```

這項檢查只驗證資料結構、JSON/TXT 一致性、來源網址形式及既有檔案校驗值；**不替代對原刻影像的逐字校對，也不保證外部網址永遠可用**。

## 底本與可追溯性

- 第 1–19、21–64 卦：哈佛燕京圖書館藏武英殿刊本，館藏號 T2354494。[館藏書目](https://id.lib.harvard.edu/alma/990079179900203941/catalog)、[原刻影像](https://nrs.lib.harvard.edu/URN-3:FHCL:4142005:VIEW)。
- 第 20 觀卦：明治大學圖書館同版別藏本，書目載北京武英殿、康熈 54 年（1715）。[館藏書目及影像](https://m-archives.meiji.jp/content/detail/LI00000554)。**同版別不等於已證明同一次印刷；更換藏本的原因未見於既有紀錄。**

每條爻辭的原頁網址都保存在 JSON 中。此資料庫不下載、打包或重新散布館藏掃描影像，也不使用館方標誌或暗示館方背書。

哈佛的[公有領域數位重製開放政策](https://library.harvard.edu/about/policies/policy-access-digital-reproductions-works-public-domain)允許符合政策的開放公有領域影像無需另付費或申請許可即再利用，並請求妥善引用館藏。明治的[利用指南](https://m-archives.meiji.jp/guide)說明 PDM 資料可免費用於商用及非商用用途，要求註明館藏出處及改動，並請求寄贈利用成果。本庫記錄轉錄行為與來源，尚未寄贈成果；不代表所有館藏資料都採相同條件。

## 校對狀態與限制

沿用一卦既有的 `scan-reviewed` 逐爻影像紀錄，原紀錄完成日期為 2026-10-01；兩份資料匯出於 2026-10-07。本次建立公開資料庫**沒有重新進行全部 384 爻的第二輪影像校對**，狀態名稱不是第三方認證，也不保證完全無誤。

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

The ancient public-domain text may be used, adapted, and used commercially without a new restriction from this transcription. Attribution to **yigua.art網站轉譯** (image transcription and preparation, not a new translation) is requested, not imposed on the public-domain text. Copyright-protected original documentation is licensed under CC BY 4.0. `node verify.mjs` checks file integrity and structure, not philological correctness.
