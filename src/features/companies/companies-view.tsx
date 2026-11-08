"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { LIST_DEFAULTS } from "@/lib/api/schemas";
import { listCompaniesOptions } from "@/lib/api/@tanstack/react-query.gen";
import { useI18n } from "@/lib/i18n/i18n-provider";
import { CompaniesTable } from "./companies-table";
import { FiltersBar } from "./filters-bar";
import { Pagination } from "./pagination";
import { useCompaniesParams } from "./search-params";
import { useDebouncedValue } from "./use-debounced-value";

const SEARCH_DEBOUNCE_MS = 300;
const PAGE_SIZE = LIST_DEFAULTS.limit;

export function CompaniesView() {
  const { t, format } = useI18n();
  const params = useCompaniesParams();
  const debouncedQ = useDebouncedValue(params.q, SEARCH_DEBOUNCE_MS);

  const { data, isPending, isError, isFetching, refetch } = useQuery({
    ...listCompaniesOptions({
      q: debouncedQ,
      status: params.status ?? undefined,
      sort: params.sort,
      limit: PAGE_SIZE,
      offset: (params.page - 1) * PAGE_SIZE,
    }),
    placeholderData: keepPreviousData,
  });

  const from = data && data.total > 0 ? data.offset + 1 : 0;
  const to = data ? data.offset + data.items.length : 0;
  const summary = data
    ? format(t.pagination.summary, { from, to, total: data.total })
    : "";

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">{t.companies.title}</h1>
      <FiltersBar
        q={params.q}
        status={params.status}
        onSearch={params.setSearch}
        onStatus={params.setStatus}
      />
      <p role="status" className="sr-only">
        {isFetching ? "" : summary}
      </p>
      <CompaniesTable
        items={data?.items}
        isPending={isPending}
        isError={isError}
        isFetching={isFetching}
        sort={params.sort}
        onSort={params.setSort}
        onOpen={params.openCompany}
        onRetry={() => void refetch()}
      />
      {data && (
        <Pagination
          page={params.page}
          pageSize={PAGE_SIZE}
          total={data.total}
          onPage={params.setPage}
        />
      )}
    </div>
  );
}
