import Link from "next/link";
import { BookCover } from "./book-cover";

export interface BookCardData {
  id: string;
  title: string;
  authors: string;
  coverId: number | null;
}

export function BookCard({
  book,
  subtitle,
}: {
  book: BookCardData;
  subtitle?: string;
}) {
  return (
    <article className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-lg focus-within:shadow-lg">
      <Link
        href={`/books/${book.id}`}
        className="block rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-600"
      >
        <BookCover coverId={book.coverId} title={book.title} />
        <h2 className="mt-4 line-clamp-2 font-semibold leading-snug group-hover:text-amber-700">
          {book.title}
        </h2>
      </Link>
      <p className="mt-1 line-clamp-1 text-sm text-slate-600">{book.authors}</p>
      {subtitle && (
        <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-amber-700">
          {subtitle}
        </p>
      )}
    </article>
  );
}
