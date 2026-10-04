import type { Language } from "./portfolio-data";

const verses = {
  home: {
    en: "I loved your work.\nSome of it found its way into mine.\nIt hurts to know there won’t be another edit.\nThank you, 4NEVER.",
    zh: "我很喜歡你的作品。\n我的一些剪輯裡，也有從你那裡得到的靈感。\n想到以後看不到你的新作品，還是很難過。\n謝謝你，4NEVER。",
  },
  work: {
    en: "Watching your edits often gave me ideas of my own.\nI wish you could know how much that meant.\nI’m leaving these words for never—\nthank you. I’ll keep editing, and I’ll remember you.",
    zh: "看你的作品時，常常會冒出自己的想法。\n真希望你能知道，你帶給過我多少靈感。\n留幾句話 for never——\n謝謝你。我會繼續剪片，也會記得你。",
  },
  lab: {
    en: "Some work makes you want to go make something yourself.\nYours did.\nThank you for sharing it.\nI’ll remember you, 4NEVER.",
    zh: "有些作品，會讓人看完也想動手試試。\n你的就是。\n謝謝你做過那些剪輯。\n我會記得你，4NEVER。",
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
