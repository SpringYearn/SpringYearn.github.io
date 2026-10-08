type LabCopy = { en: string; zh: string };
export type LabCheckpoint = { date: string; title: LabCopy; body: LabCopy };
export type LabExperiment = {
  id: string; date: { created: string; updated: string }; title: string; type: string;
  history: LabCheckpoint[];
  status: LabCopy; body: LabCopy;
  checkpoint?: { date: string; status: LabCopy; body: LabCopy };
};

export const labExperiments: LabExperiment[] = [
  {
    id: "LAB-01",
    date: {"created":"2026-09-06","updated":"2026-10-08"},
    title: "FusionDynamics2D",
    type: "Fusion Lua / Physics",
    status: { en: "0.5.0 / local checks complete; host pending", zh: "0.5.0／本地驗證完成，實機待確認" },
    body: {
      en: "0.5.0-authoring extends 0.4.1 with analytic capsule collisions, collision categories / masks / groups, density-based mass, built-in / custom material presets, scene-settings JSON import / export, Bezier and concave closed-contour import, and read-only native Mask diagnostics. The delivered package records 338 passing local tests, 80 Lua / Fuse syntax checks and 2 JavaScript syntax checks. Native Mask auto-adaptation and Viewer Overlay / Dock remain unfinished; Windows installation and Resolve host validation remain pending.",
      zh: "0.5.0-authoring 延續 0.4.1，新增解析膠囊碰撞、碰撞分類／遮罩／群組、密度自動質量、內建／自訂材質預設、物理場景設定 JSON 匯出／匯入、Bezier 與凹形閉合輪廓匯入，以及原生 Mask 只讀診斷。完整包紀錄為 338 項本地測試、80 份 Lua／Fuse 與 2 份 JavaScript 語法檢查通過。原生 Mask 自動適配與真正的 Viewer Overlay／Dock 尚未完成；Windows 安裝與 Resolve 新功能實機驗收仍待確認。",
    },
    checkpoint: {
      date: "2026.09",
      status: { en: "0.3.5 / verified checkpoint", zh: "0.3.5／已驗證 checkpoint" },
      body: {
        en: "Latest verified checkpoint: 0.3.5-perbody. Per-object start frames, text/Follower animation handoff, Alpha handling and native keyframe Bake fixes are in place; 158 tests pass, with 46 Lua/Fuse files and 2 preview JavaScript files passing syntax checks. Resolve 21 visual acceptance, split-speed and hands-on workflow validation still remain.",
        zh: "目前可驗證的最新 checkpoint 為 0.3.5-perbody。已完成每物件獨立起始影格、文字／Follower 動畫接手、Alpha 處理與原生關鍵幀 Bake 修正；158 項測試全數通過，46 份 Lua／Fuse 與 2 份預覽 JavaScript 亦通過語法檢查。Resolve 21 實機畫面、拆分速度與整體操作流程仍待最終驗收。",
      },
    },
    history: [
      {
        "date": "2026-09-06",
        "title": {
          "en": "0.1.0 / MVP",
          "zh": "0.1.0 / MVP"
        },
        "body": {
          "en": "CPU physics, native Bake, Undo and backup baseline.",
          "zh": "建立 CPU 物理、原生 Bake、Undo 與備份底座。"
        }
      },
      {
        "date": "2026-09-30",
        "title": {
          "en": "0.3.5-perbody",
          "zh": "0.3.5-perbody"
        },
        "body": {
          "en": "Per-object start frames and animation handoff; 158 automated tests passed.",
          "zh": "逐物件起始影格與動畫接手；158 項自動測試通過。"
        }
      },
      {
        "date": "2026-10-02",
        "title": {
          "en": "0.4.0-dynamics",
          "zh": "0.4.0-dynamics"
        },
        "body": {
          "en": "Added specified motion, joints, force fields and events; host tests 1–4 reported passing.",
          "zh": "加入指定運動、關節、力場與事件；主機測試 1–4 回報通過。"
        }
      },
      {
        "date": "2026-10-03",
        "title": {
          "en": "0.4.1-usability",
          "zh": "0.4.1-usability"
        },
        "body": {
          "en": "Reset / clear controls, source-adjacent layout and exact linear-key merging; new host checks pending.",
          "zh": "新增重設／清除、來源附近排版與精確直線鍵合併；新版實機確認待完成。"
        }
      },
      {
        "date": "2026-10-08",
        "title": { "en": "0.5.0-authoring", "zh": "0.5.0-authoring" },
        "body": {
          "en": "Capsules, collision filters, density mass, presets and scene / contour import; 338 local tests passed, native Mask adapter and host checks pending.",
          "zh": "加入膠囊、碰撞篩選、密度質量、預設與場景／輪廓匯入；338 項本地測試通過，原生 Mask 適配與實機仍待確認。"
        }
      }
    ],
  },
  {
    id: "LAB-02",
    date: {"created":"2026-09-16","updated":"2026-09-16"},
    title: "Paint Bucket / Flood Fill",
    type: "Fusion Fuse",
    status: { en: "Working", zh: "可用" },
    body: {
      en: "A Photoshop-like connected-area fill tool for Fusion. It reads upstream RGBA and supports tolerance, 4/8-way connectivity, alpha handling and blend controls; early crash and loading issues were fixed during testing.",
      zh: "為 Fusion 製作的類 Photoshop 連通區域填色工具，可讀取上游 RGBA，支援容差、4／8 向連通、Alpha 與 Blend 控制；早期新增節點閃退與載入問題已在測試中修正。",
    },
    history: [
      {
        "date": "2026-09-16",
        "title": {
          "en": "0.1",
          "zh": "0.1"
        },
        "body": {
          "en": "Connected-area fill with tolerance and alpha controls.",
          "zh": "建立連通填色、容差與 Alpha 控制。"
        }
      },
      {
        "date": "2026-09-16",
        "title": {
          "en": "0.1.4",
          "zh": "0.1.4"
        },
        "body": {
          "en": "Removed unsafe pixel reads during PreCalc to address early Resolve crashes.",
          "zh": "移除 PreCalc 階段的不安全像素讀取，修正早期 Resolve 閃退問題。"
        }
      }
    ],
  },
  {
    id: "LAB-03",
    date: {"created":"2026-09-23","updated":"2026-09-24"},
    title: "Lens Dirt",
    type: "Fusion / Lens FX",
    status: { en: "Functional prototype", zh: "可用原型" },
    body: {
      en: "An Ignite-inspired Lens Dirt replacement exploring light and dirt layers, external dirt maps, mirrored ghosting, radial blur, and Screen / Add compositing. The prototype was iterated against reference outputs and mix behavior.",
      zh: "以 Ignite Lens Dirt 為參考製作的替代實驗，包含 Light／Dirt Layer、外部 Dirt Map、鏡像鬼影、Radial Blur 與 Screen／Add 合成，並依參考輸出反覆調整混合行為。",
    },
    history: [
      {
        "date": "2026-09-23",
        "title": {
          "en": "0.1",
          "zh": "0.1"
        },
        "body": {
          "en": "Initial native Fusion macro with procedural dirt.",
          "zh": "初版 Fusion 原生 Macro，以程序化雜訊產生污漬。"
        }
      },
      {
        "date": "2026-09-24",
        "title": {
          "en": "0.91 / 0.92",
          "zh": "0.91 / 0.92"
        },
        "body": {
          "en": "Direct installation and black-output fixes.",
          "zh": "加入直接安裝版本，修正黑畫面輸出。"
        }
      },
      {
        "date": "2026-09-24",
        "title": {
          "en": "0.93 FullBlend",
          "zh": "0.93 FullBlend"
        },
        "body": {
          "en": "Refined full blend controls while preserving the Lens Dirt pipeline.",
          "zh": "完善完整混合控制，保留原 Lens Dirt 處理管線。"
        }
      }
    ],
  },
  {
    id: "LAB-04",
    date: {"created":"2026-09-16","updated":"2026-09-22"},
    title: "TraceGraph OFX",
    type: "C++ / OpenFX 1.4",
    status: { en: "In development", zh: "持續開發" },
    body: {
      en: "A native OFX experiment for Resolve 21 combining tracking data with procedural FUI overlays. Core phases and safety tests progressed, while final Windows and Resolve integration validation remains part of development.",
      zh: "面向 Resolve 21 的原生 OFX 實驗，將追蹤資料與程序化 FUI Overlay 結合。核心階段與安全測試已有進展，Windows 與 Resolve 的最終整合驗證仍持續進行。",
    },
    history: [
      {
        "date": "2026-09-16",
        "title": {
          "en": "0.1.0 / preview",
          "zh": "0.1.0 / preview"
        },
        "body": {
          "en": "Windows x64 preview of tracking and procedural FUI overlays.",
          "zh": "建立 Windows x64 追蹤與程序化 FUI Overlay 預覽版。"
        }
      },
      {
        "date": "2026-09-22",
        "title": {
          "en": "0.2.6",
          "zh": "0.2.6"
        },
        "body": {
          "en": "Windows release / test-build iteration.",
          "zh": "完成 Windows 發行與測試包迭代。"
        }
      },
      {
        "date": "2026-09-22",
        "title": {
          "en": "0.2.7 / GPU experimental",
          "zh": "0.2.7 / GPU experimental"
        },
        "body": {
          "en": "GPU test build delivered; final Resolve integration remains in development.",
          "zh": "交付 GPU 實驗測試版；Resolve 最終整合仍在開發。"
        }
      }
    ],
  },
  {
    id: "LAB-05",
    date: {"created":"2026-09","updated":"2026-09"},
    title: "Gaussian Splatting OFX",
    type: "C++ / OpenFX",
    status: { en: "Research / design", zh: "研究／設計階段" },
    body: {
      en: "A proposed Resolve OFX workflow for loading and manipulating Gaussian Splatting assets such as .ply, .splat and .ksplat, with transform, opacity, SH, quality and depth controls explored at the design stage.",
      zh: "研究如何在 Resolve OFX 中載入與操作 Gaussian Splatting 資產，例如 .ply、.splat、.ksplat，並規劃 Transform、Opacity、SH、Quality 與 Depth 等控制。",
    },
    history: [
      {
        "date": "2026-09",
        "title": {
          "en": "Research / design",
          "zh": "Research / design"
        },
        "body": {
          "en": "Planned asset formats, transforms, SH and depth controls; no build recorded.",
          "zh": "規劃資產格式、Transform、SH 與 Depth 控制，尚無程式版本。"
        }
      }
    ],
  },
  {
    id: "LAB-06",
    date: {"created":"2026-09-01","updated":"2026-09-01"},
    title: "Resolve Neural Compat",
    type: "OFX / Windows x64",
    status: { en: "Tested in Edit", zh: "Edit 頁面實測" },
    body: {
      en: "A lightweight compatibility experiment using multithreaded CPU edge-aware denoising and detail reconstruction. The Windows x64 OFX was successfully used on a 1080p Edit page workflow; Fusion remained outside that test.",
      zh: "以多執行緒 CPU 邊緣感知降噪與細節重建製作的相容性實驗。Windows x64 OFX 已在 1080p Edit 頁面成功使用，Fusion 當時未納入實測。",
    },
    history: [
      {
        "date": "2026-09-01",
        "title": {
          "en": "1.0.0 / x64",
          "zh": "1.0.0 / x64"
        },
        "body": {
          "en": "CPU edge-aware denoising and detail reconstruction; 1080p Edit usage reported.",
          "zh": "建立 CPU 邊緣感知降噪與細節重建，已有 1080p Edit 使用回報。"
        }
      }
    ],
  },
  {
    id: "LAB-07",
    date: {"created":"2026-04","updated":"2026-04"},
    title: "BaoGlitch",
    type: "Fusion Fuse",
    status: { en: "Early prototype", zh: "早期原型" },
    body: {
      en: "An early Resolve-compatible glitch Fuse skeleton with Amount, Jitter and Seed controls. It began as a pass-through testbed for displacement, RGB split, scanline noise and horizontal jitter experiments.",
      zh: "早期的 Resolve 相容 Glitch Fuse 骨架，具備 Amount、Jitter、Seed 控制，最初作為 Displace、RGB Split、Scanline Noise 與 Horizontal Jitter 的測試底座。",
    },
    history: [
      {
        "date": "2026-04",
        "title": {
          "en": "Early prototype",
          "zh": "Early prototype"
        },
        "body": {
          "en": "Pass-through glitch skeleton with Amount, Jitter and Seed.",
          "zh": "建立 Amount、Jitter、Seed 控制的 pass-through Glitch 骨架。"
        }
      }
    ],
  },
  {
    id: "LAB-08",
    date: {"created":"2026-04","updated":"2026-04"},
    title: "Simple Glitch",
    type: "Fusion Fuse",
    status: { en: "Compatibility prototype", zh: "相容性原型" },
    body: {
      en: "A minimal pass-through Fuse created while testing the Fusion loading path. Together with a Hello Fuse check, it helped verify that the local Fuse search path and registration flow were working before larger experiments.",
      zh: "為測試 Fusion 載入流程製作的最小化 pass-through Fuse，並搭配 Hello Fuse 驗證本機 Fuse 搜尋路徑與註冊流程，作為後續較大型實驗的基礎。",
    },
    history: [
      {
        "date": "2026-04",
        "title": {
          "en": "Loading checkpoint",
          "zh": "Loading checkpoint"
        },
        "body": {
          "en": "Minimal pass-through and Hello Fuse loading-path checks.",
          "zh": "以最小 pass-through 與 Hello Fuse 檢查載入路徑。"
        }
      }
    ],
  },
  {
    id: "LAB-09",
    date: {"created":"2026-09-30","updated":"2026-10-03"},
    title: "SY_Handwriter",
    type: "Fusion Lua / Handwriting",
    status: { en: "0.3.0 Test 4 / font fitting prototype", zh: "0.3.0 Test 4／字型貼合原型" },
    body: {
      en: "A stroke-by-stroke handwriting tool for Text+ using ordered stroke paths, MaskPaint, independent PolylineStroke Write On animation and Text+ EffectMask. The 0.2.1 coordinate fix was reported working; 0.3.0 Test 4 fits the stroke centerlines and brush coverage to the rendered Text+ Alpha while preserving the original font and appearance. The supplied Test 4 archive is available for authorized testing. Different fonts and Resolve 21 Image / Pixel behavior still await host acceptance; extreme decorative fonts and complex text layouts remain limitations.",
      zh: "為 Text+ 製作真正一筆一畫的手寫動畫：筆順路徑經 MaskPaint、獨立 PolylineStroke Write On，接入 Text+ EffectMask，保留原本字型與外觀。0.2.1 座標修正已回報正常；0.3.0 Test 4 新增以渲染後的 Text+ Alpha 貼合筆畫中心線與估算筆刷覆蓋，完整 Test 4 安裝包已提供授權測試。不同字型與 Resolve 21 Image／Pixel 介面仍待實機驗收，極端藝術字與複雜文字排版也仍有限制。",
    },
    history: [
      {
        "date": "2026-10-02",
        "title": {
          "en": "0.1.0 / MVP",
          "zh": "0.1.0 / MVP"
        },
        "body": {
          "en": "Initial Text+ animation prototype.",
          "zh": "建立初版 Text+ 動畫原型。"
        }
      },
      {
        "date": "2026-10-03",
        "title": {
          "en": "0.2.0 / 0.2.1",
          "zh": "0.2.0 / 0.2.1"
        },
        "body": {
          "en": "Independent stroke Write On and corrected PolylineStroke coordinates.",
          "zh": "加入獨立逐筆 Write On，並修正 PolylineStroke 座標。"
        }
      },
      {
        "date": "2026-10-03",
        "title": {
          "en": "0.3.0 Test 4",
          "zh": "0.3.0 Test 4"
        },
        "body": {
          "en": "Fitted stroke paths and brush coverage to rendered Text+ Alpha; host checks pending.",
          "zh": "以渲染後 Text+ Alpha 貼合筆畫與筆刷覆蓋；實機確認待完成。"
        }
      }
    ],
  },
];
