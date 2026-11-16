export interface StatsEntry {
  shelf: "want" | "reading" | "read";
  finishedAt: Date | null;
}

export interface PageLog {
  pages: number;
  loggedAt: Date;
}

export function calculateStats(
  entries: StatsEntry[],
  logs: PageLog[],
  targetBooks: number,
  now = new Date(),
) {
  const counts = { want: 0, reading: 0, read: 0 };
  for (const entry of entries) counts[entry.shelf] += 1;
  const pagesThisMonth = logs
    .filter(
      (log) =>
        log.loggedAt.getFullYear() === now.getFullYear() &&
        log.loggedAt.getMonth() === now.getMonth(),
    )
    .reduce((total, log) => total + log.pages, 0);
  const readThisYear = entries.filter(
    (entry) => entry.finishedAt?.getFullYear() === now.getFullYear(),
  ).length;
  const goalProgress =
    targetBooks > 0
      ? Math.min(100, Math.round((readThisYear / targetBooks) * 100))
      : 0;
  return { counts, pagesThisMonth, readThisYear, targetBooks, goalProgress };
}
