# Swarm Website Builder

SpringYearn 網站的獨立即時建造動畫。沒有影片、GIF、遠端動畫服務或第三方動畫引擎；所有游標、任務、逐字輸入與圖片揭露都在訪客瀏覽器裡運作。視覺概念參考 [Joel Califa 的 Swarm](https://califa.github.io/swarm-site/) 與 [Swarm Rebuild](https://github.com/DhvanilPatel/swarm-cursors)。V.077 在網站擁有者確認取得原作者授權後，參考了 Swarm Rebuild 的任務生命週期；上線程式仍為本站的獨立實作，未移植原始程式碼。

## 檔案與整合

```text
app/swarm/
  types.ts                      任務、游標、狀態的型別
  analyzer.ts                   DOM 分析、父子依賴、字形位置、還原紀錄
  scheduler.ts                  可見範圍排程、建造順序、跳過已捲過區域
  engine.ts                     任務游標、慣性進場、控制點追蹤
  timing.ts                     五倍基準時間軸
  renderer.ts                   Canvas 工具與游標、DOM 文字、實際圖片掃描
  audio.ts                      Web Audio 合成與節流
  controller.ts                 時間軸、捲動、暫停、重播與生命週期
  swarm-website-builder.tsx      六語言控制列與 Next.js 整合
  swarm.css                     獨立覆蓋層與建造狀態樣式
tests/swarm.test.mjs             物理與排程測試
scripts/verify-swarm.mjs         瀏覽器整合驗證
```

共用 `app/layout.tsx` 掛載 `<SwarmWebsiteBuilder />`。既有 CursorTrail、PointerBurst、ScreenRipple、InteractionAudio 全部保留。沒有變更作品、LAB 紀錄、下載資料或現有連結。

其他頁面只需沿用 `main.site-shell`。可用 `data-swarm-ignore` 排除不適合建造的區塊。新增版型時可在 `analyzer.ts` 的 `frames` 選擇器加入卡片或容器；文字以真正的文字節點與最近的語義元素分組，並非寫死首頁內容。

## 動畫如何工作

1. 深色 Logo 開場後，游標只在有任務時出現。桌面最多三個、手機最多兩個游標同時建造；每個任務從開始到完成都由同一個游標負責。沒有集合、繞行或待命游標。
2. 分析原始 DOM 的文件位置、父子關係與可見布局。導覽先建造，再建立框架、標題、段落、圖片與控制項。父元素未完成時不派發子任務。
3. Canvas 只負責游標、選取框、控制點、參考線、寬高讀數和複製／對齊示意。逐字顯示的字形是獨立 DOM 元素，位置由原始文字的 Range 量測而來；原始 React 文字節點不被改寫。
4. 圖片先畫佔位框，再以暫時的裁切樣式掃描原始圖片。完成後撤回樣式，顯示原有 DOM；影片、表單與白板資料不會被複製或重新載入。
5. 游標在所屬元素旁以慣性進場，之後跟著真正的文字插入點、框線控制點或掃描線工作，完成立即消失。捲入新區域時再派發任務。離開視野的工作會讓出游標；快速捲過的區域直接還原，避免回頭時留下空白。下方未看過的區域仍等待建造。
6. 全部完成、Skip、Escape、換頁或結構改變時，都撤回暫時屬性、inert、圖片裁切和覆蓋層。原本連結和事件處理器始終保留。

首次進入同一分頁工作階段會自動播放。之後跨頁保留輕巧的 Replay 入口，避免每次開作品都強迫重看；Replay 可在目前頁面與捲動位置重新建造。改語言、篩選等會交回原頁面，再按 Replay 可按新布局重建。

## 控制與存取

- Replay：依照目前真實 DOM 重新產生任務。
- Skip 或 Escape：立即還原整頁。
- Pause / Resume：凍結或恢復邏輯時間，避免恢復時突然跳到末段。
- Speed：0.5×、1×、1.5×、2×、3×。
- Sound：預設關閉；訪客點選後才建立並解鎖 Web Audio。點擊、輸入、拖曳、吸附與完成使用不同合成短音，無音訊檔案或網路請求。

V.077 的預設 1× 已是 V.076 的五倍時間軸，開場、進場、逐字輸入、選取框與圖片掃描都使用同一倍率。控制列倍率再乘上此基準。物理使用固定小步長，避免高速度下失穩。

尊重 `prefers-reduced-motion`：不自動播放，偏好在播放中改變也立即還原。等待捲動或背景分頁時停止 requestAnimationFrame；恢復時不補跑離開的時間。低核心數、低記憶體或省流裝置使用一個游標；持續掉幀會減少閒置工作槽，保留正在工作的游標。

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

已有 Chrome 時可設定 `SWARM_CHROME_PATH`；已安裝在外部的 Playwright 可用 `SWARM_PLAYWRIGHT_PATH` 指向其 `index.mjs`。測試涵蓋初始群集、真實逐字建造、暫停、速度與音效解鎖、向下捲動至完整完成、重播、Skip、換頁、手機、減少動態效果與還原後點擊。它不會提交下載密碼、發出白板申請或新增白板筆跡。

## 效能與還原邊界

DOM 字形量測集中於新任務開始前。每幀先集中讀取最多三個活動元素的位置，再做物理、Canvas、transform 和字形可見性更新；可見範圍內的待辦位置每 120ms 或捲動時更新。這樣可跟隨卡片浮動與橫向列，同時避免交錯讀寫造成 layout thrashing。原本有裁切的容器也會限制建造中的字形與框線。開場準備失敗有自動還原，控制器所有出口都會清理觀察器、計時器、requestAnimationFrame、音訊與自有樣式。

網站原始內容不需要 JavaScript 動畫才能閱讀。即使動畫模組不啟動或瀏覽器不支援 Canvas，原頁面仍保持可用。
