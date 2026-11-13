import type { Metadata } from "next";
import { Suspense } from "react";
import { BookCard } from "@/components/book-card";
import { LoadingState } from "@/components/route-states";
import { searchBooks } from "@/lib/data/open-library";

export const metadata: Metadata = { title: "Find books" };

async function Results({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q: raw = "" } = await searchParams;
  const query = raw.trim().slice(0, 120);
  const results = await searchBooks(query);
  return (
    <>
      <form
        action="/search"
        role="search"
        className="mt-8 flex max-w-2xl gap-3"
      >
        <label htmlFor="book-query" className="sr-only">
          Search books
        </label>
        <input
          id="book-query"
          name="q"
          type="search"
          defaultValue={query}
          placeholder="Title, author, or a world to explore…"
          className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3.5 outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-200"
        />
        <button
          type="submit"
          className="rounded-xl bg-slate-900 px-6 py-3 font-semibold text-white hover:bg-slate-700"
        >
          Search
        </button>
      </form>
      {!query ? (
        <p className="mt-12 text-slate-600">
          Search millions of books from Open Library.
        </p>
      ) : (
        <>
          <p className="mt-9 text-sm text-slate-600">
            {results.length} {results.length === 1 ? "result" : "results"} for{" "}
            <strong>{query}</strong>
          </p>
          {results.length ? (
            <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
              {results.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          ) : (
            <p className="mt-10 rounded-xl border border-dashed border-slate-300 p-8 text-slate-600">
              No books found. Try another title or author.
            </p>
          )}
        </>
      )}
    </>
  );
}

export default function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  return (
    <main>
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-700">
        Discover
      </p>
      <h1 className="mt-2 text-4xl font-semibold tracking-tight">
        Find your next read
      </h1>
      <Suspense
        fallback={
          <div className="mt-8">
            <LoadingState label="Searching books" />
          </div>
        }
      >
        <Results searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
