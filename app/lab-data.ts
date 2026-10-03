export const labExperiments = [
  {
    id: "LAB-01",
    date: "2026.09",
    title: "FusionDynamics2D",
    type: "Fusion Lua / Physics",
    status: { en: "0.3.5 / verified checkpoint", zh: "0.3.5／已驗證 checkpoint" },
    body: {
      en: "Latest verified checkpoint: 0.3.5-perbody. Per-object start frames, text/Follower animation handoff, Alpha handling and native keyframe Bake fixes are in place; 158 tests pass, with 46 Lua/Fuse files and 2 preview JavaScript files passing syntax checks. Resolve 21 visual acceptance, split-speed and hands-on workflow validation still remain.",
      zh: "目前可驗證的最新 checkpoint 為 0.3.5-perbody。已完成每物件獨立起始影格、文字／Follower 動畫接手、Alpha 處理與原生關鍵幀 Bake 修正；158 項測試全數通過，46 份 Lua／Fuse 與 2 份預覽 JavaScript 亦通過語法檢查。Resolve 21 實機畫面、拆分速度與整體操作流程仍待最終驗收。",
    },
  },
  {
    id: "LAB-02",
    date: "2026.09",
    title: "Paint Bucket / Flood Fill",
    type: "Fusion Fuse",
    status: { en: "Working", zh: "可用" },
    body: {
      en: "A Photoshop-like connected-area fill tool for Fusion. It reads upstream RGBA and supports tolerance, 4/8-way connectivity, alpha handling and blend controls; early crash and loading issues were fixed during testing.",
      zh: "為 Fusion 製作的類 Photoshop 連通區域填色工具，可讀取上游 RGBA，支援容差、4／8 向連通、Alpha 與 Blend 控制；早期新增節點閃退與載入問題已在測試中修正。",
    },
  },
  {
    id: "LAB-03",
    date: "2026.09",
    title: "Lens Dirt",
    type: "Fusion / Lens FX",
    status: { en: "Functional prototype", zh: "可用原型" },
    body: {
      en: "An Ignite-inspired Lens Dirt replacement exploring light and dirt layers, external dirt maps, mirrored ghosting, radial blur, and Screen / Add compositing. The prototype was iterated against reference outputs and mix behavior.",
      zh: "以 Ignite Lens Dirt 為參考製作的替代實驗，包含 Light／Dirt Layer、外部 Dirt Map、鏡像鬼影、Radial Blur 與 Screen／Add 合成，並依參考輸出反覆調整混合行為。",
    },
  },
  {
    id: "LAB-04",
    date: "2026.09",
    title: "TraceGraph OFX",
    type: "C++ / OpenFX 1.4",
    status: { en: "In development", zh: "持續開發" },
    body: {
      en: "A native OFX experiment for Resolve 21 combining tracking data with procedural FUI overlays. Core phases and safety tests progressed, while final Windows and Resolve integration validation remains part of development.",
      zh: "面向 Resolve 21 的原生 OFX 實驗，將追蹤資料與程序化 FUI Overlay 結合。核心階段與安全測試已有進展，Windows 與 Resolve 的最終整合驗證仍持續進行。",
    },
  },
  {
    id: "LAB-05",
    date: "2026.09",
    title: "Gaussian Splatting OFX",
    type: "C++ / OpenFX",
    status: { en: "Research / design", zh: "研究／設計階段" },
    body: {
      en: "A proposed Resolve OFX workflow for loading and manipulating Gaussian Splatting assets such as .ply, .splat and .ksplat, with transform, opacity, SH, quality and depth controls explored at the design stage.",
      zh: "研究如何在 Resolve OFX 中載入與操作 Gaussian Splatting 資產，例如 .ply、.splat、.ksplat，並規劃 Transform、Opacity、SH、Quality 與 Depth 等控制。",
    },
  },
  {
    id: "LAB-06",
    date: "2026.09",
    title: "Resolve Neural Compat",
    type: "OFX / Windows x64",
    status: { en: "Tested in Edit", zh: "Edit 頁面實測" },
    body: {
      en: "A lightweight compatibility experiment using multithreaded CPU edge-aware denoising and detail reconstruction. The Windows x64 OFX was successfully used on a 1080p Edit page workflow; Fusion remained outside that test.",
      zh: "以多執行緒 CPU 邊緣感知降噪與細節重建製作的相容性實驗。Windows x64 OFX 已在 1080p Edit 頁面成功使用，Fusion 當時未納入實測。",
    },
  },
  {
    id: "LAB-07",
    date: "2026.04",
    title: "BaoGlitch",
    type: "Fusion Fuse",
    status: { en: "Early prototype", zh: "早期原型" },
    body: {
      en: "An early Resolve-compatible glitch Fuse skeleton with Amount, Jitter and Seed controls. It began as a pass-through testbed for displacement, RGB split, scanline noise and horizontal jitter experiments.",
      zh: "早期的 Resolve 相容 Glitch Fuse 骨架，具備 Amount、Jitter、Seed 控制，最初作為 Displace、RGB Split、Scanline Noise 與 Horizontal Jitter 的測試底座。",
    },
  },
  {
    id: "LAB-08",
    date: "2026.04",
    title: "Simple Glitch",
    type: "Fusion Fuse",
    status: { en: "Compatibility prototype", zh: "相容性原型" },
    body: {
      en: "A minimal pass-through Fuse created while testing the Fusion loading path. Together with a Hello Fuse check, it helped verify that the local Fuse search path and registration flow were working before larger experiments.",
      zh: "為測試 Fusion 載入流程製作的最小化 pass-through Fuse，並搭配 Hello Fuse 驗證本機 Fuse 搜尋路徑與註冊流程，作為後續較大型實驗的基礎。",
    },
  },
];
