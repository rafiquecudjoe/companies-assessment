import {
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
  useQueryStates,
} from "nuqs";
import {
  COMPANY_SORTS,
  COMPANY_STATUSES,
  LIST_DEFAULTS,
} from "@/lib/api/schemas";
import type { CompanySort, CompanyStatus } from "@/lib/api/types.gen";

export const companiesParsers = {
  q: parseAsString.withDefault(""),
  status: parseAsStringLiteral(COMPANY_STATUSES),
  sort: parseAsStringLiteral(COMPANY_SORTS).withDefault(LIST_DEFAULTS.sort),
  page: parseAsInteger.withDefault(1),
  company: parseAsString,
};

export function useCompaniesParams() {
  const [params, setParams] = useQueryStates(companiesParsers, {
    clearOnDefault: true,
    history: "push",
  });

  return {
    q: params.q,
    status: params.status,
    sort: params.sort,
    page: Math.max(1, params.page),
    company: params.company,
    // Typing replaces the history entry; each filter change resets the page.
    setSearch: (q: string) =>
      setParams({ q, page: null }, { history: "replace" }),
    setStatus: (status: CompanyStatus | null) =>
      setParams({ status, page: null }),
    setSort: (sort: CompanySort) => setParams({ sort, page: null }),
    setPage: (page: number) => setParams({ page }),
    openCompany: (id: string) => setParams({ company: id }),
    closeCompany: () => setParams({ company: null }),
  };
}
