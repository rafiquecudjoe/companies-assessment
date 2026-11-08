import { describe, expect, it } from "vitest";
import { safeNextPath, signInPath } from "./safe-next";

describe("safeNextPath", () => {
  it("keeps same-site paths with their query", () => {
    expect(safeNextPath("/companies?q=acme&company=1")).toBe(
      "/companies?q=acme&company=1",
    );
  });

  it.each([
    undefined,
    "",
    "companies",
    "//evil.com",
    "/\\evil.com",
    "https://evil.com",
  ])("falls back for %j", (next) => {
    expect(safeNextPath(next)).toBe("/companies");
  });
});

describe("signInPath", () => {
  it("encodes the current path", () => {
    expect(signInPath("/companies?q=a b")).toBe(
      "/sign-in?next=%2Fcompanies%3Fq%3Da%20b",
    );
  });
});
