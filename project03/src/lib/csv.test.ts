import { describe, expect, it } from "vitest";
import { libraryToCsv } from "./csv";
import { escapeXml } from "./rss";

const row = {
  title: "A Book",
  authors: "A. Writer",
  shelf: "read",
  rating: 5,
  review: "Nice",
  pagesRead: 123,
  startedAt: new Date("2026-01-01"),
  finishedAt: new Date("2026-02-02"),
};

describe("export formats", () => {
  it("writes a header for an empty library", () => {
    expect(libraryToCsv([])).toContain('"Title","Authors"');
  });
  it("writes shelf and rating", () => {
    expect(libraryToCsv([row])).toContain('"read","5"');
  });
  it("writes ISO dates", () => {
    expect(libraryToCsv([row])).toContain('"2026-01-01","2026-02-02"');
  });
  it("escapes quotes in CSV", () => {
    expect(libraryToCsv([{ ...row, title: 'A "Book"' }])).toContain(
      '"A ""Book"""',
    );
  });
  it("keeps newlines inside quoted cells", () => {
    expect(libraryToCsv([{ ...row, review: "First\nSecond" }])).toContain(
      '"First\nSecond"',
    );
  });
  it("uses CRLF records", () => {
    expect(libraryToCsv([row])).toContain("\r\n");
  });
  it("escapes XML in reviews", () => {
    expect(escapeXml('<b title="A&B">')).toBe(
      "&lt;b title=&quot;A&amp;B&quot;&gt;",
    );
  });
});
