import { beforeEach, describe, expect, it } from "vitest";
import type { CompanyList } from "@/lib/api/types.gen";
import { apiFetch } from "@/test/api-fetch";
import { resetCompanies } from "./store";

const auth = { authorization: "Bearer test" };

function send(path: string, method = "GET", body?: unknown, headers: Record<string, string> = auth) {
  return apiFetch(`http://localhost/api/v1/companies${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

beforeEach(resetCompanies);

describe("companies API", () => {
  it("answers 401 without a bearer token", async () => {
    expect((await send("", "GET", undefined, {})).status).toBe(401);
  });

  it("lists, filters and 404s", async () => {
    const list: CompanyList = await (await send("?limit=5&status=new")).json();
    expect(list.items.length).toBeLessThanOrEqual(5);
    expect((await send("/missing")).status).toBe(404);
  });

  it("creates with 201 and version 1, and rejects an empty name with 422", async () => {
    const created = await send("", "POST", { name: "  Zeta Corp " });
    expect(created.status).toBe(201);
    expect(await created.json()).toMatchObject({ name: "Zeta Corp", version: 1, status: "new", domain: null });
    const rejected = await send("", "POST", { name: " " });
    expect(rejected.status).toBe(422);
    expect(await rejected.json()).toMatchObject({ detail: [{ loc: ["body", "name"] }] });
  });

  it("patches with version + 1 and answers 409 on a stale version", async () => {
    const patched = await send("/company-01", "PATCH", { if_version: 1, name: "Renamed" });
    expect(await patched.json()).toMatchObject({ name: "Renamed", version: 2 });
    expect((await send("/company-01", "PATCH", { if_version: 1, name: "Late" })).status).toBe(409);
  });

  it("checks 404 before 422 and 422 before 409", async () => {
    expect((await send("/missing", "PATCH", { name: "" })).status).toBe(404);
    expect((await send("/company-01", "PATCH", { if_version: 99, name: "" })).status).toBe(422);
  });
});
