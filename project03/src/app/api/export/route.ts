import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getShelf } from "@/lib/data/library";
import { libraryToCsv } from "@/lib/csv";

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session)
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  const shelves = await Promise.all(
    ["want", "reading", "read"].map((shelf) =>
      getShelf(session.user.id, shelf),
    ),
  );
  const csv = libraryToCsv(
    shelves.flatMap((rows) =>
      (rows ?? []).map(({ entry, book }) => ({
        title: book.title,
        authors: book.authors,
        shelf: entry.shelf,
        rating: entry.rating,
        review: entry.review,
        pagesRead: entry.pagesRead,
        startedAt: entry.startedAt,
        finishedAt: entry.finishedAt,
      })),
    ),
  );
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="bookshelf.csv"',
      "Cache-Control": "private, no-store",
    },
  });
}
