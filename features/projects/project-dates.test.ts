import { describe, expect, it } from "vitest";

import { formatProjectDate, parseProjectDate } from "@/features/projects/date";

describe("project dates", () => {
  it("formats date-only values for the selected locale", () => {
    expect(formatProjectDate("2026-08-01", { locale: "en-US" })).toBe(
      "Aug 1, 2026"
    );
  });

  it("parses date-only values without shifting the calendar day", () => {
    const date = parseProjectDate("2026-08-01");

    expect(date?.getFullYear()).toBe(2026);
    expect(date?.getMonth()).toBe(7);
    expect(date?.getDate()).toBe(1);
  });

  it("uses a product-friendly fallback for missing or invalid values", () => {
    expect(formatProjectDate(null)).toBe("TBD");
    expect(formatProjectDate("2026-02-31")).toBe("TBD");
    expect(formatProjectDate("", { fallback: "Select date" })).toBe(
      "Select date"
    );
  });
});
