import "server-only";
import { cache } from "react";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  books,
  readingGoals,
  readingLogs,
  shelfEntries,
  users,
} from "@/lib/db/schema";
import { calculateStats } from "@/lib/stats";
import { usernameSchema } from "@/lib/validation/auth";
import { bookIdSchema, shelfSchema } from "@/lib/validation/library";

export async function getCachedBook(id: string) {
  if (!bookIdSchema.safeParse(id).success) return null;
  const rows = await db.select().from(books).where(eq(books.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function getShelf(userId: string, shelf: string) {
  const parsed = shelfSchema.safeParse(shelf);
  if (!parsed.success) return null;
  return db
    .select({ entry: shelfEntries, book: books })
    .from(shelfEntries)
    .innerJoin(books, eq(shelfEntries.bookId, books.id))
    .where(
      and(eq(shelfEntries.userId, userId), eq(shelfEntries.shelf, parsed.data)),
    )
    .orderBy(desc(shelfEntries.updatedAt));
}

export async function getUserEntry(userId: string, entryId: string) {
  const rows = await db
    .select()
    .from(shelfEntries)
    .where(and(eq(shelfEntries.id, entryId), eq(shelfEntries.userId, userId)))
    .limit(1);
  return rows[0] ?? null;
}

export async function getEntryForBook(userId: string, bookId: string) {
  const rows = await db
    .select()
    .from(shelfEntries)
    .where(
      and(eq(shelfEntries.bookId, bookId), eq(shelfEntries.userId, userId)),
    )
    .limit(1);
  return rows[0] ?? null;
}

export const getDashboard = cache(async (userId: string) => {
  const year = new Date().getFullYear();
  const [entries, logs, goal] = await Promise.all([
    db.select().from(shelfEntries).where(eq(shelfEntries.userId, userId)),
    db.select().from(readingLogs).where(eq(readingLogs.userId, userId)),
    db
      .select()
      .from(readingGoals)
      .where(and(eq(readingGoals.userId, userId), eq(readingGoals.year, year))),
  ]);
  return calculateStats(entries, logs, goal[0]?.targetBooks ?? 12);
});

export async function getPublicProfile(username: string) {
  if (!usernameSchema.safeParse(username).success) return null;
  const found = await db
    .select()
    .from(users)
    .where(eq(users.username, username))
    .limit(1);
  const user = found[0];
  if (!user) return null;
  const readBooks = await db
    .select({ entry: shelfEntries, book: books })
    .from(shelfEntries)
    .innerJoin(books, eq(shelfEntries.bookId, books.id))
    .where(
      and(eq(shelfEntries.userId, user.id), eq(shelfEntries.shelf, "read")),
    )
    .orderBy(desc(shelfEntries.finishedAt));
  return { user, readBooks };
}

export async function getPublicUsernames() {
  return db.select({ username: users.username }).from(users);
}
