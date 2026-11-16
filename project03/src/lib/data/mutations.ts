import "server-only";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  books,
  readingGoals,
  readingLogs,
  shelfEntries,
} from "@/lib/db/schema";
import type { Shelf } from "@/lib/db/schema";
import { getCachedBook, getEntryForBook, getUserEntry } from "./library";
import { getOpenLibraryBook } from "./open-library";

async function requireOwnedEntry(userId: string, entryId: string) {
  const entry = await getUserEntry(userId, entryId);
  if (!entry) throw new Error("This book is not on your shelf.");
  return entry;
}

export async function addBookForUser(
  userId: string,
  bookId: string,
  shelf: Shelf,
) {
  const existing = await getEntryForBook(userId, bookId);
  if (existing) return moveEntry(userId, existing.id, shelf);
  const cached = await getCachedBook(bookId);
  if (!cached) {
    const book = await getOpenLibraryBook(bookId);
    if (!book) throw new Error("Book not found on Open Library.");
    await db
      .insert(books)
      .values({ ...book, updatedAt: new Date() })
      .onConflictDoNothing();
  }
  const now = new Date();
  const entry = {
    id: crypto.randomUUID(),
    userId,
    bookId,
    shelf,
    startedAt: shelf === "reading" ? now : null,
    finishedAt: shelf === "read" ? now : null,
    createdAt: now,
    updatedAt: now,
  };
  await db.insert(shelfEntries).values(entry);
  return entry;
}

export async function moveEntry(userId: string, entryId: string, shelf: Shelf) {
  const entry = await requireOwnedEntry(userId, entryId);
  const now = new Date();
  await db
    .update(shelfEntries)
    .set({
      shelf,
      startedAt:
        shelf === "reading" ? (entry.startedAt ?? now) : entry.startedAt,
      finishedAt: shelf === "read" ? (entry.finishedAt ?? now) : null,
      updatedAt: now,
    })
    .where(and(eq(shelfEntries.id, entryId), eq(shelfEntries.userId, userId)));
  return { ...entry, shelf };
}

export async function rateEntry(
  userId: string,
  entryId: string,
  rating: number,
) {
  const entry = await requireOwnedEntry(userId, entryId);
  if (entry.shelf !== "read")
    throw new Error("Mark the book as read before rating it.");
  await db
    .update(shelfEntries)
    .set({ rating, updatedAt: new Date() })
    .where(and(eq(shelfEntries.id, entryId), eq(shelfEntries.userId, userId)));
  return entry.bookId;
}

export async function reviewEntry(
  userId: string,
  entryId: string,
  review: string,
) {
  const entry = await requireOwnedEntry(userId, entryId);
  if (entry.shelf !== "read")
    throw new Error("Mark the book as read before reviewing it.");
  await db
    .update(shelfEntries)
    .set({ review, updatedAt: new Date() })
    .where(and(eq(shelfEntries.id, entryId), eq(shelfEntries.userId, userId)));
  return entry.bookId;
}

export async function logProgress(
  userId: string,
  entryId: string,
  pages: number,
) {
  const entry = await requireOwnedEntry(userId, entryId);
  const now = new Date();
  await db.transaction(async (tx) => {
    await tx
      .update(shelfEntries)
      .set({ pagesRead: entry.pagesRead + pages, updatedAt: now })
      .where(
        and(eq(shelfEntries.id, entryId), eq(shelfEntries.userId, userId)),
      );
    await tx.insert(readingLogs).values({
      id: crypto.randomUUID(),
      userId,
      entryId,
      pages,
      loggedAt: now,
    });
  });
  return entry.bookId;
}

export async function setReadingGoal(userId: string, targetBooks: number) {
  const year = new Date().getFullYear();
  await db
    .insert(readingGoals)
    .values({ userId, year, targetBooks })
    .onConflictDoUpdate({
      target: [readingGoals.userId, readingGoals.year],
      set: { targetBooks },
    });
}
