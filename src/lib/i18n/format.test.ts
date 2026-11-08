import { describe, expect, it } from "vitest";
import { formatDate, interpolate } from "./format";
import { en } from "./en";
import { nl } from "./nl";
import { parseLocale } from "./locale";

describe("interpolate", () => {
  it("fills placeholders and leaves unknown ones", () => {
    expect(
      interpolate("{from}-{to} of {total} {x}", { from: 1, to: 20, total: 40 }),
    ).toBe("1-20 of 40 {x}");
  });
});

describe("formatDate", () => {
  it("follows the locale", () => {
    const iso = "2026-03-05T10:00:00Z";
    expect(formatDate(iso, "en")).toMatch(/Mar/);
    expect(formatDate(iso, "nl")).toMatch(/mrt/);
  });
});

describe("parseLocale", () => {
  it("falls back to English", () => {
    expect(parseLocale("nl")).toBe("nl");
    expect(parseLocale("fr")).toBe("en");
    expect(parseLocale(undefined)).toBe("en");
  });
});

describe("dictionaries", () => {
  it("have the same placeholders in every language", () => {
    const placeholders = (text: string) =>
      text
        .match(/\{\w+\}/g)
        ?.sort()
        .join() ?? "";
    expect(placeholders(nl.pagination.summary)).toBe(
      placeholders(en.pagination.summary),
    );
    expect(placeholders(nl.table.edit)).toBe(placeholders(en.table.edit));
    expect(placeholders(nl.conflict.latestSaved)).toBe(
      placeholders(en.conflict.latestSaved),
    );
  });
});
