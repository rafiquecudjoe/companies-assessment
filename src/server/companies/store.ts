import type { Company, CompanyStatus } from "@/lib/api/types.gen";
import { buildSeedCompanies } from "./seed";

// On globalThis so dev hot reloads keep the data.
const globalStore = globalThis as typeof globalThis & { __companies?: Company[] };

function companies(): Company[] {
  globalStore.__companies ??= buildSeedCompanies();
  return globalStore.__companies;
}

type CompanyChanges = { name?: string; domain?: string | null; status?: CompanyStatus };

export function getAllCompanies(): readonly Company[] {
  return companies();
}

export function findCompany(id: string): Company | undefined {
  return companies().find((company) => company.id === id);
}

export function createCompany(input: { name: string; domain?: string | null; status?: CompanyStatus }): Company {
  const now = new Date().toISOString();
  const company: Company = {
    id: crypto.randomUUID(),
    name: input.name,
    domain: input.domain ?? null,
    status: input.status ?? "new",
    version: 1,
    created_at: now,
    updated_at: now,
  };
  companies().push(company);
  return company;
}

export function updateCompany(existing: Company, changes: CompanyChanges): Company {
  const updated: Company = {
    ...existing,
    ...changes,
    version: existing.version + 1,
    updated_at: new Date().toISOString(),
  };
  const list = companies();
  list[list.indexOf(existing)] = updated;
  return updated;
}

export function resetCompanies(): void {
  globalStore.__companies = undefined;
}
