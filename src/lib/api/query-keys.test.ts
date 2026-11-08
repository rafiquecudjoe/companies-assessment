import { describe, expect, it } from "vitest";
import {
  companiesQueryKey,
  getCompanyQueryKey,
  listCompaniesOptions,
  listCompaniesQueryKey,
} from "./@tanstack/react-query.gen";

describe("query keys", () => {
  it("shares one entry between empty params and explicit defaults", () => {
    expect(listCompaniesQueryKey({})).toEqual(
      listCompaniesQueryKey({
        limit: 20,
        offset: 0,
        q: " ",
        sort: "-created_at",
      }),
    );
  });

  it("changes when any parameter changes", () => {
    const base = listCompaniesQueryKey({});
    const changed = [
      listCompaniesQueryKey({ limit: 10 }),
      listCompaniesQueryKey({ offset: 20 }),
      listCompaniesQueryKey({ q: "acme" }),
      listCompaniesQueryKey({ status: "new" }),
      listCompaniesQueryKey({ sort: "name" }),
    ];
    for (const key of changed) expect(key).not.toEqual(base);
  });

  it("starts every key with the shared prefix", () => {
    expect(listCompaniesQueryKey().slice(0, 1)).toEqual(companiesQueryKey);
    expect(getCompanyQueryKey("a").slice(0, 1)).toEqual(companiesQueryKey);
  });

  it("uses the same key in the options helper", () => {
    expect(listCompaniesOptions({ q: "x" }).queryKey).toEqual(
      listCompaniesQueryKey({ q: "x" }),
    );
  });
});
