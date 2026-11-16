import { sql } from "drizzle-orm";
import {
  check,
  integer,
  primaryKey,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

const date = (name: string) =>
  integer(name, { mode: "timestamp_ms" }).notNull();

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" })
    .notNull()
    .default(false),
  image: text("image"),
  createdAt: date("created_at"),
  updatedAt: date("updated_at"),
});

export const session = sqliteTable("session", {
  id: text("id").primaryKey(),
  expiresAt: date("expires_at"),
  token: text("token").notNull().unique(),
  createdAt: date("created_at"),
  updatedAt: date("updated_at"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
});

export const account = sqliteTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: integer("access_token_expires_at", {
    mode: "timestamp_ms",
  }),
  refreshTokenExpiresAt: integer("refresh_token_expires_at", {
    mode: "timestamp_ms",
  }),
  scope: text("scope"),
  password: text("password"),
  createdAt: date("created_at"),
  updatedAt: date("updated_at"),
});

export const verification = sqliteTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: date("expires_at"),
  createdAt: date("created_at"),
  updatedAt: date("updated_at"),
});

export const books = sqliteTable("books", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  authors: text("authors").notNull(),
  coverId: integer("cover_id"),
  description: text("description"),
  pageCount: integer("page_count"),
  updatedAt: date("updated_at"),
});

export const shelfEntries = sqliteTable(
  "shelf_entries",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    bookId: text("book_id")
      .notNull()
      .references(() => books.id, { onDelete: "cascade" }),
    shelf: text("shelf", { enum: ["want", "reading", "read"] }).notNull(),
    rating: integer("rating"),
    review: text("review"),
    pagesRead: integer("pages_read").notNull().default(0),
    startedAt: integer("started_at", { mode: "timestamp_ms" }),
    finishedAt: integer("finished_at", { mode: "timestamp_ms" }),
    createdAt: date("created_at"),
    updatedAt: date("updated_at"),
  },
  (table) => [
    uniqueIndex("shelf_user_book_unique").on(table.userId, table.bookId),
    check("shelf_valid", sql`${table.shelf} in ('want', 'reading', 'read')`),
    check(
      "rating_valid",
      sql`${table.rating} is null or ${table.rating} between 1 and 5`,
    ),
    check("pages_read_valid", sql`${table.pagesRead} >= 0`),
  ],
);

export const readingGoals = sqliteTable(
  "reading_goals",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    year: integer("year").notNull(),
    targetBooks: integer("target_books").notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.year] }),
    check("goal_positive", sql`${table.targetBooks} between 1 and 1000`),
  ],
);

export type Shelf = (typeof shelfEntries.$inferSelect)["shelf"];

export const readingLogs = sqliteTable(
  "reading_logs",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    entryId: text("entry_id")
      .notNull()
      .references(() => shelfEntries.id, { onDelete: "cascade" }),
    pages: integer("pages").notNull(),
    loggedAt: date("logged_at"),
  },
  (table) => [check("pages_positive", sql`${table.pages} > 0`)],
);
