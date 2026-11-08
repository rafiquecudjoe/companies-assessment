import type { Company, CompanyList } from "@/lib/api/types.gen";
import type { ListParams } from "@/lib/api/schemas";

function compareBySort(
  sort: ListParams["sort"],
): (a: Company, b: Company) => number {
  const direction = sort.startsWith("-") ? -1 : 1;
  const field = sort.replace("-", "");
  return (a, b) =>
    direction *
    (field === "name"
      ? a.name.localeCompare(b.name)
      : a.created_at.localeCompare(b.created_at));
}

function matchesQuery(company: Company, query: string): boolean {
  const needle = query.toLowerCase();
  return (
    company.name.toLowerCase().includes(needle) ||
    (company.domain ?? "").toLowerCase().includes(needle)
  );
}

export function listCompanies(
  all: readonly Company[],
  params: ListParams,
): CompanyList {
  const matching = all
    .filter((company) => !params.status || company.status === params.status)
    .filter((company) => !params.q || matchesQuery(company, params.q))
    .sort(compareBySort(params.sort));
  return {
    items: matching.slice(params.offset, params.offset + params.limit),
    total: matching.length,
    limit: params.limit,
    offset: params.offset,
  };
}
