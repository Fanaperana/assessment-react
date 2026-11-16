import { readFileSync } from "node:fs";
import { join } from "node:path";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { books, shelfEntries, users } from "@/lib/db/schema";
import { testClient, testDb } from "./test-db";

const currentUser = vi.hoisted(() => ({ id: "user-a", username: "alice" }));
vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/db", async () => ({ db: (await import("./test-db")).testDb }));
vi.mock("@/lib/data/session", () => ({ requireUser: async () => currentUser }));
vi.mock("@/lib/data/open-library", () => ({
  getOpenLibraryBook: async (id: string) => ({
    id,
    title: "Test Book",
    authors: "Test Author",
    coverId: null,
    description: null,
    pageCount: 200,
  }),
}));

import { addBookAction, moveBookAction, rateBookAction } from "./library";

function form(values: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(values)) data.set(key, value);
  return data;
}

beforeAll(async () => {
  for (const filename of [
    "0000_curly_thunderbolts.sql",
    "0001_reflective_blonde_phantom.sql",
  ]) {
    const sql = readFileSync(join(process.cwd(), "drizzle", filename), "utf8");
    for (const statement of sql.split("--> statement-breakpoint")) {
      if (statement.trim()) await testClient.execute(statement);
    }
  }
});

beforeEach(async () => {
  for (const table of ["reading_logs", "shelf_entries", "books", "users"])
    await testClient.execute(`DELETE FROM ${table}`);
  const now = new Date();
  await testDb.insert(users).values([
    {
      id: "user-a",
      name: "Alice",
      username: "alice",
      email: "alice@test.local",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "user-b",
      name: "Bob",
      username: "bob",
      email: "bob@test.local",
      createdAt: now,
      updatedAt: now,
    },
  ]);
});

describe("server actions with a fake session and SQLite", () => {
  it("adds a book to the signed-in user's shelf", async () => {
    const result = await addBookAction(
      {},
      form({ bookId: "OL1W", shelf: "want" }),
    );
    expect(result.success).toBe(true);
    expect((await testDb.select().from(shelfEntries))[0]).toMatchObject({
      userId: "user-a",
      bookId: "OL1W",
      shelf: "want",
    });
  });
  it("rejects invalid book data without writing", async () => {
    const result = await addBookAction(
      {},
      form({ bookId: "bad", shelf: "want" }),
    );
    expect(result.errors?.bookId).toBeDefined();
    expect(await testDb.select().from(books)).toHaveLength(0);
  });
  it("moves only a book owned by the signed-in user", async () => {
    await addBookAction({}, form({ bookId: "OL2W", shelf: "want" }));
    const entry = (await testDb.select().from(shelfEntries))[0];
    const result = await moveBookAction(
      {},
      form({ entryId: entry.id, shelf: "read" }),
    );
    expect(result.success).toBe(true);
    expect((await testDb.select().from(shelfEntries))[0].shelf).toBe("read");
  });
  it("does not move another user's entry", async () => {
    await addBookAction({}, form({ bookId: "OL3W", shelf: "want" }));
    const entry = (await testDb.select().from(shelfEntries))[0];
    currentUser.id = "user-b";
    try {
      const result = await moveBookAction(
        {},
        form({ entryId: entry.id, shelf: "read" }),
      );
      expect(result.message).toMatch(/not on your shelf/);
      expect((await testDb.select().from(shelfEntries))[0].shelf).toBe("want");
    } finally {
      currentUser.id = "user-a";
    }
  });
  it("rates a read book", async () => {
    await addBookAction({}, form({ bookId: "OL4W", shelf: "read" }));
    const entry = (await testDb.select().from(shelfEntries))[0];
    const result = await rateBookAction(
      {},
      form({ entryId: entry.id, rating: "5" }),
    );
    expect(result.success).toBe(true);
    expect((await testDb.select().from(shelfEntries))[0].rating).toBe(5);
  });
  it("does not rate an unread book", async () => {
    await addBookAction({}, form({ bookId: "OL5W", shelf: "want" }));
    const entry = (await testDb.select().from(shelfEntries))[0];
    const result = await rateBookAction(
      {},
      form({ entryId: entry.id, rating: "5" }),
    );
    expect(result.message).toMatch(/Mark the book as read/);
    expect((await testDb.select().from(shelfEntries))[0].rating).toBeNull();
  });
});
