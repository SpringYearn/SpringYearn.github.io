export type ProjectDates = {
  published?: string;
  created?: string;
  updated?: string;
  recorded?: string;
};

// Public publication records and matched original-file timestamps, in Asia/Taipei.
// Missing values are deliberate; checkout / website upload dates are not artwork dates.
export const projectDates: Record<string, ProjectDates> = {
  "01": { published: "2026-03-31", created: "2026-03-31", updated: "2026-03-31" },
  "02": { published: "2025-11-27", created: "2025-11-27", updated: "2025-11-27" },
  "03": { published: "2025-06-29", created: "2025-06-29", updated: "2025-06-29" },
  "04": { published: "2024-10-24" },
  "05": { recorded: "2024", created: "2024-08-24", updated: "2024-08-24" },
  "06": { recorded: "2024-07", updated: "2024-07-14" },
  "07": { recorded: "2024", created: "2024-07-08", updated: "2024-07-08" },
  "08": { recorded: "2025", created: "2025-01-31", updated: "2025-01-31" },
  "09": { recorded: "2024-09", created: "2024-09-18", updated: "2024-09-18" },
  "10": { recorded: "2024-09", created: "2024-09-16", updated: "2024-09-16" },
  "11": { created: "2024-05-22", updated: "2024-05-22" },
  "12": { created: "2023-10-13", updated: "2023-10-13" },
  "13": { updated: "2025-11-13" },
  "14": { updated: "2024-06-21" },
  "15": { updated: "2024-06-21" },
  "16": { updated: "2023-06-16" },
  "17": { updated: "2023-06-18" },
  "18": { updated: "2023-09-07" },
  "20": { created: "2026-04-20", updated: "2026-04-20" },
  "21": { created: "2026-04-21", updated: "2026-04-21" },
  "22": { updated: "2025-01-15" },
  "23": { updated: "2025-01-15" },
  "24": { updated: "2025-01-15" },
  "25": { updated: "2024-06-21" },
  "28": { published: "2025-02-12", created: "2025-02-12", updated: "2025-02-12" },
};
