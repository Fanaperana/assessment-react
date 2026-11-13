import "server-only";
import { notFound } from "next/navigation";
import { AddBookForm } from "./forms/add-book-form";
import { MoveBookForm } from "./forms/move-book-form";
import { ProgressForm, RatingForm, ReviewForm } from "./forms/book-entry-forms";
import { BookCover } from "./book-cover";
import { getCachedBook, getEntryForBook } from "@/lib/data/library";
import { getOpenLibraryBook } from "@/lib/data/open-library";
import { requireUser } from "@/lib/data/session";

export async function BookDetail({ id }: { id: string }) {
  const user = await requireUser(`/books/${id}`);
  const cached = await getCachedBook(id);
  const book = cached ?? (await getOpenLibraryBook(id));
  if (!book) notFound();
  const entry = await getEntryForBook(user.id, id);
  return (
    <article className="grid gap-8 lg:grid-cols-[230px_1fr]">
      <div className="max-w-[230px]">
        <BookCover coverId={book.coverId} title={book.title} size="L" />
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-700">
          Open Library work
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
          {book.title}
        </h1>
        <p className="mt-2 text-lg text-slate-600">{book.authors}</p>
        {book.description && (
          <p className="mt-6 max-w-3xl whitespace-pre-line leading-7 text-slate-700">
            {book.description.slice(0, 1400)}
          </p>
        )}
        {book.pageCount && (
          <p className="mt-3 text-sm text-slate-500">
            About {book.pageCount} pages
          </p>
        )}
        <div className="mt-8 space-y-5">
          {entry ? (
            <>
              <MoveBookForm entryId={entry.id} shelf={entry.shelf} />
              <p className="text-sm text-slate-600">
                You have logged {entry.pagesRead} pages.
              </p>
              <ProgressForm entryId={entry.id} />
              {entry.shelf === "read" && (
                <>
                  <RatingForm entryId={entry.id} rating={entry.rating} />
                  <ReviewForm entryId={entry.id} review={entry.review} />
                </>
              )}
            </>
          ) : (
            <AddBookForm bookId={id} />
          )}
        </div>
      </div>
    </article>
  );
}
