import type { Language } from "./portfolio-data";

const verses = {
  home: {
    en: "your edits left a light in the way I see.\nI keep a quiet corner for never—\nfor you, and the frames that stay\nlong after the screen goes dark.",
    zh: "你的剪輯，曾照亮我看世界的方式。\n留一處微光 for never，\n留給你，也留給那些畫格——\n銀幕暗下，仍在心裡播放。",
  },
  work: {
    en: "your rhythm still finds the cuts I make.\nbetween two frames, I leave a little room\nfor never, for the light you left behind—\na farewell the final fade cannot erase.",
    zh: "如今的剪接裡，仍有你留下的節奏。\n兩幀之間，留一點空白，\nfor never，也為你留下的光——\n讓告別，不被最後一次淡出抹去。",
  },
  lab: {
    en: "your edits opened doors I am still walking through.\nI leave one frame unfinished for never—\nfor the ideas you set in motion,\nand the light I will carry into what comes next.",
    zh: "你的剪輯，曾推開我創作裡的一扇門。\n留一幀未完成 for never，\n留給被你喚醒的念頭，\n也留給往後創作裡，仍會亮起的光。",
  },
};

export function ForNever({ language, place }: { language: Language; place: keyof typeof verses }) {
  return (
    <details className="for-never">
      <summary aria-label={language === "en" ? "Remembering 4NEVER" : "紀念 4NEVER"}>
        <svg className="for-never-frame" viewBox="0 0 38 18" fill="none" aria-hidden="true">
          <path d="M17 5V2H2V16H17V13" />
          <path className="for-never-continuation" d="M11 9H36" />
        </svg>
        <span className="for-never-mark" aria-hidden="true">4NEVER</span>
      </summary>
      <div className="for-never-note">
        <p className="for-never-title">{language === "en" ? "In memory of 4NEVER" : "紀念 4NEVER"}</p>
        <p className="for-never-verse">{verses[place][language]}</p>
        <p className="for-never-signature">— SpringYearn</p>
      </div>
    </details>
  );
}
