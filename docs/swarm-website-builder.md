# Swarm Website Builder

SpringYearn 網站的獨立即時建造動畫。沒有影片、GIF、遠端動畫服務或第三方動畫引擎；所有游標、任務、逐字輸入與圖片揭露都在訪客瀏覽器裡運作。視覺概念參考 [Joel Califa 的 Swarm](https://califa.github.io/swarm-site/) 與 [Swarm Rebuild](https://github.com/DhvanilPatel/swarm-cursors)。V.077 在網站擁有者確認取得原作者授權後，參考了 Swarm Rebuild 的任務生命週期；上線程式仍為本站的獨立實作，未移植原始程式碼。

## 檔案與整合

```text
app/swarm/
  types.ts                      任務、游標、狀態的型別
  analyzer.ts                   DOM 分析、父子依賴、字形位置、還原紀錄
  scheduler.ts                  可見範圍排程、建造順序、跳過已捲過區域
  engine.ts                     任務游標、慣性進場、控制點追蹤
  timing.ts                     統一基準時間軸
  choreography.ts               選取框移動、複製、掃描與尺寸標籤幾何
  renderer.ts                   Canvas 工具與游標、DOM 文字、實際圖片掃描
  audio.ts                      Web Audio 合成與節流
  availability.ts               桌面尺寸與滑鼠／觸控板門檻
  controller.ts                 時間軸、捲動、暫停、重播與生命週期
  swarm-website-builder.tsx      六語言略過按鈕與 Next.js 整合
  swarm.css                     獨立覆蓋層與建造狀態樣式
tests/swarm.test.mjs             物理與排程測試
scripts/verify-swarm.mjs         瀏覽器整合驗證
```

共用 `app/layout.tsx` 掛載 `<SwarmWebsiteBuilder />`。既有 CursorTrail、PointerBurst、ScreenRipple、InteractionAudio 全部保留。沒有變更作品、LAB 紀錄、下載資料或現有連結。

其他頁面只需沿用 `main.site-shell`。可用 `data-swarm-ignore` 排除不適合建造的區塊。新增版型時可在 `analyzer.ts` 的 `frames` 選擇器加入卡片或容器；文字以真正的文字節點與最近的語義元素分組，並非寫死首頁內容。

## 動畫如何工作

1. 動畫只在寬度至少 901px、支援 hover 與精準指標的電腦上啟動。手機、觸控裝置與小視窗直接顯示原頁面，並延後載入引擎至符合桌面條件時。深色 Logo 開場後，最多三個游標同時建造；每個任務由同一游標負責，連續完成三至五項後退場。
2. 分析原始 DOM 的文件位置、父子關係與可見布局。導覽先建造，再建立框架、標題、段落、圖片與控制項。父元素未完成時不派發子任務。
3. Canvas 只負責游標、選取框、控制點、參考線、寬高讀數和複製／對齊示意。逐字顯示的字形是獨立 DOM 元素，位置由原始文字的 Range 量測而來；原始 React 文字節點不被改寫。
4. 圖片先畫佔位框，再以暫時的裁切樣式掃描原始圖片。完成後撤回樣式，顯示原有 DOM；影片、表單與白板資料不會被複製或重新載入。
5. 游標在第一個元素旁以慣性進場，之後跟著真正的文字插入點、框線控制點或掃描線工作。同批下一項工作優先沿用同一游標，保留位置與移動慣性，不重新出現在目的地。三至五項後退場；若可見範圍已沒有工作、捲離或中斷，也會提早退場。捲入新區域時再派發任務。快速捲過的區域直接還原，避免回頭時留下空白。
6. 全部完成、Skip、Escape、換頁或結構改變時，都撤回暫時屬性、inert、圖片裁切和覆蓋層。原本連結和事件處理器始終保留。

符合桌面條件時，每個分頁工作階段自動播放一次，使用獨立的桌面播放紀錄。手機瀏覽不會消耗這次播放。之後跨頁直接瀏覽原內容；改語言、篩選、切到手機版或啟用減少動態效果，都會還原頁面並清理引擎與音效。

## 控制與存取

- Skip 或 Escape：立即還原整頁。
- 左下角只顯示略過按鈕，完成後移除。新分頁可再次觀看動畫。
- 音效預設開啟，以 Web Audio 合成滑鼠按下／放開、機械鍵盤與輕微拖曳摩擦聲；吸附與完成使用短促按鍵聲。所有聲音均限流、低音量，沒有外部音檔或網路請求。
- 若瀏覽器暫停自動播放，音效會等待第一次真實點擊或鍵盤操作後恢復，並在略過、完成或停用時關閉。參考 [Chrome Web Audio 自動播放規則](https://developer.chrome.com/blog/autoplay/#web_audio)。

目前進入頁面的速度為 V.077 的一半，即 V.076 的 2.5 倍時間軸。開場、進場、逐字輸入、選取框與圖片掃描使用統一時間軸。物理使用固定小步長，避免高速度下失穩。

明顯捲離進入位置後，後續建造以兩倍速度追上新區塊，包含游標移動、輸入與圖片揭露；停下捲動後仍會快速完成，避免速度反覆跳動。小幅位置調整不觸發加速，深色開場也維持原速。

建造工具採用更深的藍框與紅色參考線、7px 控制點、12px 尺寸標籤。選取框與游標共享同一份幾何；複製從實際來源框移向目標框，對齊從偏移位置貼齊參考線。圖片等定位階段結束後才開始掃描。標籤依視窗大小限制位置，避免超出手機畫面。

尊重 `prefers-reduced-motion`：直接呈現原頁面，偏好在播放中改變也立即還原。等待捲動或背景分頁時停止 requestAnimationFrame；恢復時不補跑離開的時間。低核心數、低記憶體或省流的電腦使用一個游標；持續掉幀會減少閒置工作槽，保留正在工作的游標。

覆蓋層本體永遠 `pointer-events: none`，只有控制列接收點擊。尚未完成的原始元素暫時 inert，避免不可見連結獲取鍵盤焦點；狀態會完整還原。

## 執行與驗證

```powershell
npm ci
npm run build:github
node --test tests/*.test.mjs
python -m http.server 4173 --bind 127.0.0.1 --directory out
```

在另一個終端執行瀏覽器驗證。Playwright 只用於測試，不是上線依賴：

```powershell
npm install --no-save --package-lock=false playwright
npx playwright install chromium
node scripts/verify-swarm.mjs http://127.0.0.1:4173
```

已有 Chrome 時可設定 `SWARM_CHROME_PATH`；外部 Playwright 可用 `SWARM_PLAYWRIGHT_PATH` 指向其 `index.mjs`。測試涵蓋逐字建造、兩種速度、預設音效與真實操作啟用、只顯示略過、完整捲動、換頁、手機與寬觸控裝置不啟動、響應式清理、減少動態效果及還原後點擊。它不會提交下載密碼、發出白板申請或新增白板筆跡。

## 效能與還原邊界

DOM 字形量測集中於新任務開始前。每幀先集中讀取最多三個活動元素的位置，再做物理、Canvas、transform 和字形可見性更新；可見範圍內的待辦位置每 120ms 或捲動時更新。這樣可跟隨卡片浮動與橫向列，同時避免交錯讀寫造成 layout thrashing。原本有裁切的容器也會限制建造中的字形與框線。開場準備失敗有自動還原，控制器所有出口都會清理觀察器、計時器、requestAnimationFrame、音訊與自有樣式。

網站原始內容不需要 JavaScript 動畫才能閱讀。即使動畫模組不啟動或瀏覽器不支援 Canvas，原頁面仍保持可用。
