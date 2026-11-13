import { createClient } from "@libsql/client";
import { hashPassword } from "better-auth/crypto";
import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import {
  account,
  books,
  readingGoals,
  readingLogs,
  shelfEntries,
  users,
} from "./schema";

const password = process.env.SEED_USER_PASSWORD ?? "";
if (!password || password.length < 12) {
  throw new Error(
    "Set SEED_USER_PASSWORD to at least 12 characters in .env.local.",
  );
}

async function seed() {
  const client = createClient({
    url: process.env.DATABASE_URL ?? "file:./bookshelf.db",
  });
  const db = drizzle(client);
  await migrate(db, { migrationsFolder: "./drizzle" });

  const demoUsers = [
    {
      name: "Maya Chen",
      username: "mayareads",
      email: "maya@example.test",
      books: [
        {
          id: "OL893414W",
          title: "Dune",
          authors: "Frank Herbert",
          coverId: 11481354,
        },
        {
          id: "OL66554W",
          title: "Pride and Prejudice",
          authors: "Jane Austen",
          coverId: 14348537,
        },
        {
          id: "OL27482W",
          title: "The Hobbit",
          authors: "J. R. R. Tolkien",
          coverId: 14627509,
        },
      ],
      shelf: "read" as const,
      rating: 5,
      review: "A world I wanted to keep exploring.",
    },
    {
      name: "Alex Rivera",
      username: "alexpages",
      email: "alex@example.test",
      books: [
        {
          id: "OL82563W",
          title: "Harry Potter and the Philosopher's Stone",
          authors: "J. K. Rowling",
          coverId: null,
        },
      ],
      shelf: "reading" as const,
      rating: null,
      review: null,
    },
  ];

  const now = new Date();
  for (const demo of demoUsers) {
    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, demo.email));
    const userId = existing[0]?.id ?? crypto.randomUUID();
    if (!existing.length) {
      await db.insert(users).values({
        id: userId,
        name: demo.name,
        username: demo.username,
        email: demo.email,
        createdAt: now,
        updatedAt: now,
      });
      await db.insert(account).values({
        id: crypto.randomUUID(),
        accountId: userId,
        providerId: "credential",
        userId,
        password: await hashPassword(password),
        createdAt: now,
        updatedAt: now,
      });
    }
    for (const book of demo.books) {
      await db
        .insert(books)
        .values({ ...book, updatedAt: now })
        .onConflictDoUpdate({
          target: books.id,
          set: { coverId: book.coverId },
        });
      const existingEntry = await db
        .select({ id: shelfEntries.id })
        .from(shelfEntries)
        .where(
          and(
            eq(shelfEntries.userId, userId),
            eq(shelfEntries.bookId, book.id),
          ),
        );
      if (existingEntry.length) continue;
      const entryId = crypto.randomUUID();
      const pagesRead = demo.shelf === "read" ? 412 : 126;
      await db.insert(shelfEntries).values({
        id: entryId,
        userId,
        bookId: book.id,
        shelf: demo.shelf,
        rating: demo.rating,
        review: demo.review,
        pagesRead,
        finishedAt: demo.shelf === "read" ? now : null,
        createdAt: now,
        updatedAt: now,
      });
      await db.insert(readingLogs).values({
        id: crypto.randomUUID(),
        userId,
        entryId,
        pages: pagesRead,
        loggedAt: now,
      });
    }
    await db
      .insert(readingGoals)
      .values({ userId, year: now.getFullYear(), targetBooks: 12 })
      .onConflictDoNothing();
  }

  console.log("Demo library ready: mayareads and alexpages.");
  client.close();
}

seed().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
