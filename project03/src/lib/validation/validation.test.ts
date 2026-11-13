import { describe, expect, it } from "vitest";
import { signUpSchema, usernameSchema } from "./auth";
import {
  addBookSchema,
  goalSchema,
  progressSchema,
  ratingSchema,
  reviewSchema,
  shelfSchema,
} from "./library";
import { searchResponseSchema, workResponseSchema } from "./open-library";

describe("form schemas", () => {
  it.each(["reader_1", "abc", "name123"])("accepts username %s", (value) => {
    expect(usernameSchema.safeParse(value).success).toBe(true);
  });
  it.each(["AB", "Upper", "a-b", "contains space"])(
    "rejects username %s",
    (value) => {
      expect(usernameSchema.safeParse(value).success).toBe(false);
    },
  );
  it("rejects weak signup data", () => {
    expect(
      signUpSchema.safeParse({
        name: "A",
        username: "a",
        email: "bad",
        password: "123",
      }).success,
    ).toBe(false);
  });
  it.each(["want", "reading", "read"])("accepts shelf %s", (value) => {
    expect(shelfSchema.safeParse(value).success).toBe(true);
  });
  it("rejects an unknown shelf", () => {
    expect(
      addBookSchema.safeParse({ bookId: "OL123W", shelf: "archive" }).success,
    ).toBe(false);
  });
  it("rejects an invalid work ID", () => {
    expect(
      addBookSchema.safeParse({ bookId: "../secret", shelf: "read" }).success,
    ).toBe(false);
  });
  it.each([0, 6, 1.5])("rejects rating %s", (rating) => {
    expect(
      ratingSchema.safeParse({ entryId: crypto.randomUUID(), rating }).success,
    ).toBe(false);
  });
  it("accepts rating 5", () => {
    expect(
      ratingSchema.safeParse({ entryId: crypto.randomUUID(), rating: "5" })
        .success,
    ).toBe(true);
  });
  it("rejects an oversized review", () => {
    expect(
      reviewSchema.safeParse({
        entryId: crypto.randomUUID(),
        review: "a".repeat(1001),
      }).success,
    ).toBe(false);
  });
  it("rejects zero pages", () => {
    expect(
      progressSchema.safeParse({ entryId: crypto.randomUUID(), pages: "0" })
        .success,
    ).toBe(false);
  });
  it("rejects a nonpositive goal", () => {
    expect(goalSchema.safeParse({ targetBooks: "0" }).success).toBe(false);
  });
});

describe("Open Library responses", () => {
  it("parses a search response", () => {
    expect(
      searchResponseSchema.parse({
        docs: [{ key: "/works/OL1W", title: "Book" }],
      }).docs,
    ).toHaveLength(1);
  });
  it("rejects a missing search docs array", () => {
    expect(searchResponseSchema.safeParse({ results: [] }).success).toBe(false);
  });
  it("parses a work", () => {
    expect(
      workResponseSchema.parse({ key: "/works/OL1W", title: "Book" }).title,
    ).toBe("Book");
  });
  it("rejects a work without a title", () => {
    expect(workResponseSchema.safeParse({ description: "Text" }).success).toBe(
      false,
    );
  });
});
