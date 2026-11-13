import "server-only";
import { bookIdSchema } from "@/lib/validation/library";
import {
  authorResponseSchema,
  searchResponseSchema,
  workResponseSchema,
} from "@/lib/validation/open-library";

export interface LibraryBook {
  id: string;
  title: string;
  authors: string;
  coverId: number | null;
  description: string | null;
  pageCount: number | null;
}

const origin = "https://openlibrary.org";

async function json(response: Response): Promise<unknown> {
  if (!response.ok)
    throw new Error(`Open Library returned ${response.status}.`);
  return response.json();
}

export async function searchBooks(query: string): Promise<LibraryBook[]> {
  const q = query.trim().slice(0, 120);
  if (q.length < 2) return [];
  const url = `${origin}/search.json?${new URLSearchParams({ q, limit: "24", fields: "key,title,author_name,cover_i,number_of_pages_median" })}`;
  const response = await fetch(url, { next: { revalidate: 3600 } });
  const parsed = searchResponseSchema.parse(await json(response));
  return parsed.docs
    .filter((book) => /^\/works\/OL\d+W$/.test(book.key))
    .map((book) => ({
      id: book.key.slice("/works/".length),
      title: book.title,
      authors: book.author_name?.slice(0, 3).join(", ") || "Unknown author",
      coverId: book.cover_i ?? null,
      description: null,
      pageCount: book.number_of_pages_median ?? null,
    }));
}

export async function getOpenLibraryBook(
  id: string,
): Promise<LibraryBook | null> {
  if (!bookIdSchema.safeParse(id).success) return null;
  const response = await fetch(`${origin}/works/${id}.json`, {
    next: { revalidate: 86400 },
  });
  if (response.status === 404) return null;
  const work = workResponseSchema.parse(await json(response));
  const authorKeys =
    work.authors?.slice(0, 3).map((item) => item.author.key) ?? [];
  const names = await Promise.all(
    authorKeys.map(async (key) => {
      if (!/^\/authors\/OL\d+A$/.test(key)) return null;
      const authorResponse = await fetch(`${origin}${key}.json`, {
        next: { revalidate: 86400 },
      });
      if (!authorResponse.ok) return null;
      return authorResponseSchema.parse(await json(authorResponse)).name;
    }),
  );
  return {
    id,
    title: work.title,
    authors:
      names.filter((name): name is string => !!name).join(", ") ||
      "Unknown author",
    coverId: work.covers?.find((cover) => cover > 0) ?? null,
    description:
      typeof work.description === "string"
        ? work.description
        : (work.description?.value ?? null),
    pageCount: null,
  };
}
