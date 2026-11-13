export interface ExportRow {
  title: string;
  authors: string;
  shelf: string;
  rating: number | null;
  review: string | null;
  pagesRead: number;
  startedAt: Date | null;
  finishedAt: Date | null;
}

function cell(value: string | number | null) {
  const text = String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

export function libraryToCsv(rows: ExportRow[]) {
  const header = [
    "Title",
    "Authors",
    "Shelf",
    "Rating",
    "Review",
    "Pages read",
    "Started",
    "Finished",
  ];
  return (
    [
      header.map(cell).join(","),
      ...rows.map((row) =>
        [
          row.title,
          row.authors,
          row.shelf,
          row.rating,
          row.review,
          row.pagesRead,
          row.startedAt?.toISOString().slice(0, 10) ?? null,
          row.finishedAt?.toISOString().slice(0, 10) ?? null,
        ]
          .map(cell)
          .join(","),
      ),
    ].join("\r\n") + "\r\n"
  );
}
