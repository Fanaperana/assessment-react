import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { BookCard } from "@/components/book-card";
import { MoveBookForm } from "@/components/forms/move-book-form";
import { LoadingState } from "@/components/route-states";
import { getShelf } from "@/lib/data/library";
import { requireUser } from "@/lib/data/session";
import { shelfSchema } from "@/lib/validation/library";

const labels = { want: "Want to read", reading: "Reading", read: "Read" };

// This route depends on the request session and a user-specific SQLite query.
// Keep it streaming, but opt out of Next's instant-navigation shell check.
export const instant = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ shelf: string }>;
}): Promise<Metadata> {
  const { shelf } = await params;
  return {
    title: shelfSchema.safeParse(shelf).success
      ? labels[shelf as keyof typeof labels]
      : "Shelf not found",
  };
}

async function ShelfContent({
  params,
}: {
  params: Promise<{ shelf: string }>;
}) {
  const { shelf } = await params;
  const parsed = shelfSchema.safeParse(shelf);
  if (!parsed.success) notFound();
  const user = await requireUser(`/shelves/${shelf}`);
  const items = await getShelf(user.id, parsed.data);
  return (
    <>
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-700">
        My library
      </p>
      <h1 className="mt-2 text-4xl font-semibold">{labels[parsed.data]}</h1>
      <nav aria-label="Shelves" className="mt-6 flex flex-wrap gap-2">
        {Object.entries(labels).map(([key, label]) => (
          <Link
            key={key}
            href={`/shelves/${key}`}
            aria-current={key === shelf ? "page" : undefined}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${key === shelf ? "bg-slate-900 text-white" : "border border-slate-300 hover:bg-white"}`}
          >
            {label}
          </Link>
        ))}
      </nav>
      {items?.length ? (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map(({ entry, book }) => (
            <div key={entry.id} className="space-y-3">
              <BookCard
                book={book}
                subtitle={`${entry.pagesRead} pages logged`}
              />
              <MoveBookForm entryId={entry.id} shelf={entry.shelf} />
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-10 rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <p className="text-slate-600">No books on this shelf yet.</p>
          <Link
            href="/search"
            className="mt-3 inline-block font-semibold text-amber-700 hover:underline"
          >
            Find a book →
          </Link>
        </div>
      )}
    </>
  );
}

export default function ShelfPage({
  params,
}: {
  params: Promise<{ shelf: string }>;
}) {
  return (
    <main>
      <Suspense fallback={<LoadingState label="Loading shelf" />}>
        <ShelfContent params={params} />
      </Suspense>
    </main>
  );
}
