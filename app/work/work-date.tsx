import { Localized } from "../localized";
import type { Language } from "../portfolio-data";
import { projectDates } from "./project-dates";
import { workDateFor, type WorkSortKey } from "./project-sort";

export function WorkDate({ id, language, basis = "date" }: { id: string; language: Language; basis?: WorkSortKey }) {
  const dates = projectDates[id];
  const { source, date } = workDateFor(dates, basis);
  const label = source === "published" ? (language === "en" ? "Published" : "發布") : source === "created" ? (language === "en" ? "File created" : "原檔建立") : source === "updated" ? (basis === "updated" ? (language === "en" ? "File modified" : "原檔修改") : (language === "en" ? "File clue" : "檔案線索")) : (language === "en" ? "Recorded" : "年份紀錄");
  const details = [
    dates?.published && `${language === "en" ? "Published" : "發布"}: ${dates.published}`,
    dates?.created && `${language === "en" ? "Source file created" : "原檔建立"}: ${dates.created}`,
    dates?.updated && `${language === "en" ? "Source file modified" : "原檔修改"}: ${dates.updated}`,
  ].filter(Boolean).join(" / ");
  return <Localized>{<span className="work-date mono-label" title={details || undefined}>{date ? <>{label} / <time dateTime={date}>{date.replaceAll("-", ".")}</time></> : (language === "en" ? "Date unconfirmed" : "日期待考")}</span>}</Localized>;
}
