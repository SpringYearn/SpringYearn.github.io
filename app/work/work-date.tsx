import { Localized } from "../localized";
import type { Language } from "../portfolio-data";
import { projectDates } from "./project-dates";
import { workDateFor, type WorkSortKey } from "./project-sort";

export function WorkDate({ id, language, basis = "date" }: { id: string; language: Language; basis?: WorkSortKey }) {
  const dates = projectDates[id];
  const { source, date } = workDateFor(dates, basis);
  const zh = language === "zh";
  const labels = {
    published: zh ? "發布於" : "Published",
    created: zh ? "建立於" : "File created",
    updated: zh ? "" : (basis === "updated" ? "File modified" : "File clue"),
    recorded: zh ? "年份紀錄" : "Recorded",
  };
  const label = labels[source];
  const details = [
    dates?.published && `${labels.published}: ${dates.published}`,
    dates?.created && `${zh ? "檔案建立於" : "Source file created"}: ${dates.created}`,
    dates?.updated && `${zh ? "檔案更新於" : "Source file modified"}: ${dates.updated}`,
  ].filter(Boolean).join(" / ");
  return <Localized>
    <span className="work-date mono-label" title={details || undefined}>
      {date ? <>{label && <>{label} / </>}<time dateTime={date}>{date.replaceAll("-", ".")}</time></> : (zh ? "年份未標註" : "Date unconfirmed")}
    </span>
  </Localized>;
}
