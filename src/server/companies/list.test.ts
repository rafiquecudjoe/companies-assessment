import { describe, expect, it } from "vitest";
import { listParamsSchema } from "@/lib/api/schemas";
import { listCompanies } from "./list";
import { buildSeedCompanies } from "./seed";

const all = buildSeedCompanies();
const parse = (query: Record<string, string>) => listParamsSchema.parse(query);

describe("seed", () => {
  it("has 40 companies with unique ids", () => {
    expect(all).toHaveLength(40);
    expect(new Set(all.map((company) => company.id)).size).toBe(40);
  });
});

describe("listCompanies", () => {
  it("paginates with the defaults", () => {
    const result = listCompanies(all, parse({}));
    expect(result).toMatchObject({ total: 40, limit: 20, offset: 0 });
    expect(result.items).toHaveLength(20);
  });

  it("searches name and domain, ignoring case", () => {
    const result = listCompanies(all, parse({ q: "ACME-" }));
    expect(result.total).toBeGreaterThan(0);
    expect(result.items.every((company) => company.domain?.includes("acme-"))).toBe(true);
  });

  it("filters by status", () => {
    const result = listCompanies(all, parse({ status: "qualified", limit: "100" }));
    expect(result.items.every((company) => company.status === "qualified")).toBe(true);
  });

  it("sorts by name descending", () => {
    const names = listCompanies(all, parse({ sort: "-name" })).items.map((company) => company.name);
    expect(names).toEqual([...names].sort((a, b) => b.localeCompare(a)));
  });

  it("falls back to defaults on bad params", () => {
    expect(parse({ limit: "abc", offset: "-3", status: "nope", sort: "x" })).toEqual({
      limit: 20,
      offset: 0,
      q: "",
      status: undefined,
      sort: "-created_at",
    });
  });
});
