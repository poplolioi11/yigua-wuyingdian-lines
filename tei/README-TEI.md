# 武英殿爻辭 TEI 編碼 0.1.0

本檔說明既有《御纂周易折中》武英殿爻辭 JSON 的 TEI P5 格式轉換。TEI 編碼日期為 **2026-10-11**，格式編碼版本為 **0.1.0**；這個版本號不代表古籍資料另做校對，也不代替來源資料版本。

範圍仍為 **64 卦、384 條普通爻辭，以及乾用九、坤用六共 2 則**。不含卦辭、注解、傳文、全書或館藏掃描影像。本次只轉換固定來源資料，沒有重新核對全部原刻影像、獨立校勘或人工雙校。來源 JSON/TXT 保持原有內容與校驗值。

## 來源版本

- 來源庫：[poplolioi11/yigua-wuyingdian-lines](https://github.com/poplolioi11/yigua-wuyingdian-lines)
- Git 提交：`3c8e0309e30b2263d94c164e135c7e69cc415b7f`
- [固定提交 JSON](https://github.com/poplolioi11/yigua-wuyingdian-lines/blob/3c8e0309e30b2263d94c164e135c7e69cc415b7f/wuying-lines.json)
- 來源 JSON SHA-256：`184d9b6fdeb2fbce08384b917e42d2ce75b74c46210a69496870476d6f53a732`
- 來源 TXT SHA-256：`1a52a95326505e1bd932ab04465f7c31b9f357e2ea290726c913c9a1e10827db`
- 原資料匯出日期：`2026-10-07`；metadata 更新日期：`2026-10-10`。兩者均不是本次 TEI 編碼或新的原刻全校日期。

來源庫以 Git 提交與檔案 SHA-256 識別資料，沒有在本轉換中為古籍語料新設語義版本。`convert-tei.mjs` 拒絕與固定 JSON 校驗值不同的輸入，避免改過文字卻沿用此版來源識別。

## 編碼映射與回讀

`wuying-lines.tei.xml` 採 `http://www.tei-c.org/ns/1.0` 命名空間與完整 `teiHeader`。正文位於 `text/body`，每卦為 `div type="hexagram"`，卦序保存於 `n`，卦名保存於 `head`。XML id 固定為 `h01` 至 `h64`；普通爻為 `h01-l1` 等，每卦由初爻至上爻排列。

每個 `ab type="ordinary"` 的文字內容與來源 JSON `lines` 的完整字串一樣，含原有的爻位標題與全形冒號「：」。不作 Unicode 正規化、異體字替換、簡繁轉換、補文或補標點；冒號仍是資料欄位分隔，不是為古籍新增句讀。`facs` 原樣保存同索引的 `lineSources` URL；這是原頁連結，沒有新增影像座標或逐字對齊。

用九、用六為 `ab type="special"`，將原 `label`、全形冒號與 `text` 組合為與原 TXT 相同的閱讀字串；`n` 另保存 label，可還原來源物件。**來源 JSON 未附兩則用辭各自獨立原頁證據，這兩個 ab 因此不設 facs**，各附來源缺口說明。普通爻的六條影像來源不能代替此缺口。

每卦的原 `source`、`sourceUrl`、`status` 另存於 TEI `note/ref`。損卦的原 `sourceNote` 原字串保存於 `note type="sourceNote"`。這些都是資料說明，**不是古籍正文**；使用古籍閱讀內容時只取兩類 `ab`，不要把所有 `div.itertext()` 當作爻辭。`scan-reviewed` 沿用既有紀錄，不是第三方認證、無誤保證或新一輪影像校對。

第 20 觀卦的 6 條原頁連結及卦層級 `sourceUrl` 保留明治大學藏本，其他 63 卦保留哈佛燕京藏本。`div/@corresp` 分別指向 header 的 `source-meiji` 與 `source-harvard`。同版別不代表已證明同一次印刷，既有紀錄未述更換藏本的原因。損卦上九的印墨缺損與同頁、次頁旁證說明保持原有內容。

`teiHeader/xenoData` 內另以非 TEI 命名空間 `https://yigua.art/ns/source-metadata/1.0` 的 `json` 保存完整來源 JSON 原字串，供所有 metadata 無損回讀。這個命名空間是本格式標記，不是外部服務或古籍權威資料庫；嵌入 JSON 不是閱讀正文。現有 UTF-8 JSON 沒有 CR 換行，本次標準 XML 解析後可還原相同字串與 SHA-256。

整理者仍為 **一卦 yigua.art / poplolioi11**，保留 **yigua.art網站轉譯** 署名。這些是資料整理責任，不列作古籍作者；本庫尚未獨立整理古籍責任者權威記錄。本檔沒有添入 ORCID、學術機構關係、館方背書或未經核實的作者姓名。

## 生成與驗證

轉換程式需 Node.js 18 或更新版本，沒有套件依賴。`tei/TEI-RELEASE.json` 保存本次經外部查核的 DOI 與查核日期，不改動古籍來源 JSON；轉換及驗證的命令列入口預設讀入它。本目錄預設以相對於程式檔案的 `../wuying-lines.json` 與 `../wuying-lines.txt` 為來源，因此不受命令執行目錄影響。從儲存庫根目錄執行：

```sh
node tei/convert-tei.mjs
node tei/verify-tei.mjs
node --test tei/tei.test.mjs
```

本庫不打包官方 schema。下載已固定版本的 `tei_all.rng` 到儲存庫外部後，從根目錄指定來源、XML 與外部 schema 路徑；相對參數路徑以命令執行目錄解析：

```sh
node tei/verify-tei.mjs wuying-lines.json tei/wuying-lines.tei.xml /path/to/tei_all.rng
TEI_SCHEMA_PATH=/path/to/tei_all.rng node --test tei/tei.test.mjs
```

亦可用 `TEI_SCHEMA_PATH=/path/to/tei_all.rng node tei/verify-tei.mjs` 保留來源及 XML 預設路徑。未提供外部 schema 時，驗證摘要明列 Relax NG `not-run`，測試會略過唯一的 schema 驗證項，其他 20 項仍執行；明列的 schema 路徑不存在、校驗值錯誤或不通過驗證時，命令會失敗。若需改用其他來源目錄或輸出檔，可用 `node tei/convert-tei.mjs /path/to/wuying-lines.json /path/to/output.xml` 與 `WUYING_SOURCE_DIR=/path/to/source-directory node --test tei/tei.test.mjs`；來源仍必須符合此版固定 SHA-256。

驗證程式用 Python 3 標準庫 ElementTree **獨立解析 XML**，然後從 TEI body 回建全部 64 個卦記錄，逐字對比 384 條爻辭、2 則用辭、384 條原頁 URL、source/sourceUrl、status、sourceNote 及卦序。亦回讀 header 內完整來源 JSON，核對原字串、完整物件與固定校驗值，並比對所有 64 個原 TXT 閱讀／來源區塊。`PYTHON` 環境變數可指定 Python 執行檔。

`tei.test.mjs` 含反向測試，確認更換古字、刪掉冒號、改動來源或狀態、將觀卦換藏本、為用辭填入虛構 facs、改動損卦限制、重複 XML id、改動 metadata 或爻序均會失敗。驗證不是只檢查 XML 能否解析，也不是只比較生成前後 XML 字串。

XML 的 `xml-model` 指向官方 **TEI P5 4.12.0** 固定版本的 [tei_all.rng](https://www.tei-c.org/Vault/P5/4.12.0/xml/tei/custom/schema/relaxng/tei_all.rng)。傳入外部 schema 路徑時，`verify-tei.mjs` 先核對其 SHA-256 `b0f115095ead2ccc6933aa3365c6f4a82cba3b2ec7eee7f76bb616d7a63b7e48`，再以 `xmllint --nonet --relaxng` 驗證；未提供 schema 時明列 `not-run`，不將回讀通過說成 TEI schema 驗證通過。一般 TEI_all schema 不替代專屬 ODD、數位校勘方法、原刻逐字覆核、來源 URL 可用性或閱讀內容正確性，本編碼未提供專屬 ODD 與完整校勘 apparatus。

## 權利、引用與 DOI

古籍原文仍為公有領域，不因 TEI 格式轉換新增限制。達著作權保護門檻的原創說明依來源庫 [LICENSE.md](https://github.com/poplolioi11/yigua-wuyingdian-lines/blob/3c8e0309e30b2263d94c164e135c7e69cc415b7f/LICENSE.md) 採 CC BY 4.0；converter、verifier 與測試小程式標示 0BSD。館藏影像只留連結，不打包散布。這個資料編碼不涵蓋私有 yigua.art 網站程式碼。

引用時分開記錄 TEI 編碼版本 `0.1.0`、編碼日期 `2026-10-11`、來源完整 Git 提交及來源 JSON/TXT 校驗值；古籍版別與館藏原頁另外引用。截至 `2026-10-11` 編碼準備時，Zenodo 草稿已預留 **`10.5281/zenodo.23298982`**，當次查核尚未發布。XML header 保留這項有日期的狀態說明；後續正式發布、版本與記錄狀態應查 [Zenodo 記錄](https://zenodo.org/records/23298982)，不能由靜態 XML 的準備紀錄推定即時狀態。草稿、預留識別碼與正式發布是不同狀態，不使用占位字串冒充 DOI。

`convertTei(sourceBytes, { doiRecord })` 接受可選的 `{ doi, status, statusCheckedAt }`；status 必須為 `reserved` 或 `published`，日期必須明列。這些本地檢查只能驗證語法與欄位一致性，不能自行證明 DOI 已註冊或記錄已發布；輸入須先經外部查核。命令列可在 source/output 之後另給 `DOI STATUS CHECKED_DATE`，驗證器則在 source/XML/schema 之後另給相同三項。未提供來源紀錄時，純函式預設不增補 DOI。

校對疑義及自願分享重用成果，請使用來源庫 [Issues](https://github.com/poplolioi11/yigua-wuyingdian-lines/issues)。原始 [PROVENANCE.md](https://github.com/poplolioi11/yigua-wuyingdian-lines/blob/3c8e0309e30b2263d94c164e135c7e69cc415b7f/PROVENANCE.md) 的來源缺口、既有覆核日期及 AI 歷程限制仍適用；TEI 編碼與 schema 驗證不補足這些證據。
