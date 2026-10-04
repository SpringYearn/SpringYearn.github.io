import type { Language } from "./portfolio-data";

const verses = {
  home: {
    en: "a light leaves the screen,\nnot the room.\nsome frames keep finding us.",
    zh: "光離開了銀幕，\n卻沒有離開房間。\n有些畫格，仍在往後的日子裡顯影。",
  },
  work: {
    en: "the cut falls quiet.\nin the space between frames,\na little of your light goes on.",
    zh: "剪接處靜了下來。\n兩幀之間，\n你留下的光，仍緩緩向前。",
  },
  lab: {
    en: "the last frame stays unwritten.\nwhat you left in the light\nis still becoming.",
    zh: "最後一幀，暫且留白。\n你留在光裡的，\n仍在未完成的事物中生長。",
  },
};

export function ForNever({ language, place }: { language: Language; place: keyof typeof verses }) {
  return (
    <details className="for-never">
      <summary aria-label={language === "en" ? "A frame for 4NEVER" : "留給 4NEVER 的一幀"}>
        <svg className="for-never-frame" viewBox="0 0 38 18" fill="none" aria-hidden="true">
          <path d="M17 5V2H2V16H17V13" />
          <path className="for-never-continuation" d="M11 9H36" />
        </svg>
        <span className="for-never-mark" aria-hidden="true"><span>04 / ∞</span><span>for never...</span></span>
      </summary>
      <div className="for-never-note">
        <p className="for-never-title">for never...</p>
        <p className="for-never-verse">{verses[place][language]}</p>
        <p className="for-never-signature">— 4NEVER</p>
      </div>
    </details>
  );
}
