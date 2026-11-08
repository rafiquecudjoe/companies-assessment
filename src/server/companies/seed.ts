import type { Company } from "@/lib/api/types.gen";
import { COMPANY_STATUSES } from "@/lib/api/schemas";

const NAME_STARTS = [
  "Acme",
  "Borealis",
  "Cobalt",
  "Delta",
  "Ember",
  "Fjord",
  "Granite",
  "Harbor",
];
const NAME_ENDS = ["Logistics", "Software", "Foods", "Energy", "Media"];
const FIRST_CREATED_AT = Date.UTC(2025, 0, 6, 9, 30);
const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

function buildCompany(index: number): Company {
  const start = NAME_STARTS[index % NAME_STARTS.length];
  const end = NAME_ENDS[Math.floor(index / NAME_STARTS.length)];
  const createdAt = new Date(
    FIRST_CREATED_AT + index * THREE_DAYS_MS,
  ).toISOString();
  return {
    id: `company-${String(index + 1).padStart(2, "0")}`,
    name: `${start} ${end}`,
    domain:
      index % 7 === 0 ? null : `${start}-${end}`.toLowerCase() + ".example",
    status: COMPANY_STATUSES[index % COMPANY_STATUSES.length] ?? "new",
    version: 1,
    created_at: createdAt,
    updated_at: createdAt,
  };
}

export function buildSeedCompanies(): Company[] {
  return Array.from(
    { length: NAME_STARTS.length * NAME_ENDS.length },
    (_, index) => buildCompany(index),
  );
}
