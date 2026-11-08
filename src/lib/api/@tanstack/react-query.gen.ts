import { mutationOptions, queryOptions } from "@tanstack/react-query";
import { LIST_DEFAULTS } from "../schemas";
import { createCompany, getCompany, listCompanies, updateCompany } from "../sdk.gen";
import type { CreateCompanyBody, ListCompaniesParams, UpdateCompanyBody } from "../types.gen";

// Every key starts with this, so one invalidate covers lists and details.
export const companiesQueryKey = ["companies"] as const;

// Fills defaults and drops empty values, so equal requests share one cache entry.
function normalizeListParams({ limit, offset, q, status, sort }: ListCompaniesParams) {
  const search = q?.trim();
  return {
    limit: limit ?? LIST_DEFAULTS.limit,
    offset: offset ?? LIST_DEFAULTS.offset,
    sort: sort ?? LIST_DEFAULTS.sort,
    ...(search ? { q: search } : {}),
    ...(status ? { status } : {}),
  };
}

export const listCompaniesQueryKey = (params: ListCompaniesParams = {}) =>
  [...companiesQueryKey, "list", normalizeListParams(params)] as const;

export const getCompanyQueryKey = (id: string) => [...companiesQueryKey, "detail", id] as const;

export const listCompaniesOptions = (params: ListCompaniesParams = {}) =>
  queryOptions({
    queryKey: listCompaniesQueryKey(params),
    queryFn: ({ signal }) => listCompanies(params, { signal }),
  });

export const getCompanyOptions = (id: string) =>
  queryOptions({
    queryKey: getCompanyQueryKey(id),
    queryFn: ({ signal }) => getCompany(id, { signal }),
  });

export const createCompanyMutation = () =>
  mutationOptions({ mutationFn: (body: CreateCompanyBody) => createCompany(body) });

export const updateCompanyMutation = () =>
  mutationOptions({
    mutationFn: ({ id, body }: { id: string; body: UpdateCompanyBody }) => updateCompany(id, body),
  });
