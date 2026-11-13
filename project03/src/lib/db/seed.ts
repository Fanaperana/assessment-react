import { createClient } from "@libsql/client";
import { hashPassword } from "better-auth/crypto";
import { eq } from "drizzle-orm";
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
      book: { id: "OL893414W", title: "Dune", authors: "Frank Herbert" },
      shelf: "read" as const,
      rating: 5,
      review: "A world I wanted to keep exploring.",
    },
    {
      name: "Alex Rivera",
      username: "alexpages",
      email: "alex@example.test",
      book: {
        id: "OL82563W",
        title: "Harry Potter and the Philosopher's Stone",
        authors: "J. K. Rowling",
      },
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
    if (existing.length > 0) continue;
    const userId = crypto.randomUUID();
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
    await db
      .insert(books)
      .values({ ...demo.book, updatedAt: now })
      .onConflictDoNothing();
    const entryId = crypto.randomUUID();
    const pagesRead = demo.shelf === "read" ? 412 : 126;
    await db.insert(shelfEntries).values({
      id: entryId,
      userId,
      bookId: demo.book.id,
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
    await db
      .insert(readingGoals)
      .values({ userId, year: now.getFullYear(), targetBooks: 12 });
  }

  console.log("Demo library ready: mayareads and alexpages.");
  client.close();
}

seed().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
