import { describe, expect, it } from "vitest";
import { calculateStats } from "./stats";

const now = new Date(2026, 10, 13);

describe("reading statistics", () => {
  it("counts each shelf", () => {
    const result = calculateStats(
      [
        { shelf: "want", finishedAt: null },
        { shelf: "read", finishedAt: now },
      ],
      [],
      5,
      now,
    );
    expect(result.counts).toEqual({ want: 1, reading: 0, read: 1 });
  });
  it("counts only pages logged this month", () => {
    const result = calculateStats(
      [],
      [
        { pages: 10, loggedAt: now },
        { pages: 20, loggedAt: new Date(2026, 9, 31) },
      ],
      5,
      now,
    );
    expect(result.pagesThisMonth).toBe(10);
  });
  it("counts finished books in the current year", () => {
    const result = calculateStats(
      [
        { shelf: "read", finishedAt: now },
        { shelf: "read", finishedAt: new Date(2025, 11, 31) },
      ],
      [],
      5,
      now,
    );
    expect(result.readThisYear).toBe(1);
  });
  it("calculates goal progress", () => {
    expect(
      calculateStats([{ shelf: "read", finishedAt: now }], [], 4, now)
        .goalProgress,
    ).toBe(25);
  });
  it("caps progress at 100 percent", () => {
    expect(
      calculateStats(
        [
          { shelf: "read", finishedAt: now },
          { shelf: "read", finishedAt: now },
        ],
        [],
        1,
        now,
      ).goalProgress,
    ).toBe(100);
  });
  it("handles an empty library", () => {
    expect(calculateStats([], [], 12, now).pagesThisMonth).toBe(0);
  });
});
