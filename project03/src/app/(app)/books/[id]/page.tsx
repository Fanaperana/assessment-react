import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { BookDetail } from "@/components/book-detail";
import { getOpenLibraryBook } from "@/lib/data/open-library";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const book = await getOpenLibraryBook(id);
  if (!book) return { title: "Book not found" };
  return {
    title: book.title,
    description: `Read about ${book.title} by ${book.authors} on Bookshelf.`,
    alternates: { canonical: `/books/${id}` },
  };
}

async function BookContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <BookDetail id={id} />;
}

export default function BookPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <main>
      <Link
        href="/search"
        className="mb-8 inline-block text-sm font-semibold text-amber-700 hover:underline"
      >
        ← Back to search
      </Link>
      <Suspense
        fallback={
          <div className="h-96 animate-pulse rounded-2xl bg-slate-200" />
        }
      >
        <BookContent params={params} />
      </Suspense>
    </main>
  );
}
