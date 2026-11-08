import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { resetCompanies } from "@/server/companies/store";
import { stubApiFetch } from "@/test/api-fetch";
import { ApiError, fieldErrors } from "./errors";
import { createCompany, getCompany, listCompanies, updateCompany } from "./sdk.gen";
import { clearToken, setToken } from "./token-store";

async function catchError(promise: Promise<unknown>): Promise<unknown> {
  return promise.then(
    () => undefined,
    (error: unknown) => error,
  );
}

beforeEach(() => {
  resetCompanies();
  setToken("abc");
});

afterEach(() => {
  vi.unstubAllGlobals();
  clearToken();
});

describe("client", () => {
  it("sends the bearer token and the query string", async () => {
    const fetchSpy = stubApiFetch();
    const list = await listCompanies({ q: "acme", status: "new", limit: 5 });
    expect(list.limit).toBe(5);
    const [url, init] = fetchSpy.mock.calls[0] ?? [];
    expect(url).toBe("/api/v1/companies?q=acme&status=new&limit=5");
    expect(new Headers(init?.headers).get("authorization")).toBe("Bearer abc");
  });

  it("throws ApiError 401 without a token", async () => {
    stubApiFetch();
    clearToken();
    expect(await catchError(getCompany("company-01"))).toMatchObject({ status: 401 });
  });

  it("throws ApiError 409 on a stale version", async () => {
    stubApiFetch();
    await updateCompany("company-01", { if_version: 1, name: "First" });
    const error = await catchError(updateCompany("company-01", { if_version: 1, name: "Second" }));
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 409, body: { detail: expect.any(String) } });
  });

  it("maps a 422 to field errors", async () => {
    stubApiFetch();
    const error = await catchError(createCompany({ name: "" }));
    expect(error).toMatchObject({ status: 422 });
    expect(fieldErrors(error)).toEqual({ name: "Name is required" });
  });
});

describe("fieldErrors", () => {
  it("ignores other errors", () => {
    expect(fieldErrors(new ApiError(409, { detail: "x" }))).toEqual({});
    expect(fieldErrors(new Error("boom"))).toEqual({});
    expect(fieldErrors(new ApiError(422, "garbage"))).toEqual({});
  });
});
