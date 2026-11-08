"use client";

import type { Company, CompanySort } from "@/lib/api/types.gen";
import { useI18n } from "@/lib/i18n/i18n-provider";

type Props = {
  items: Company[] | undefined;
  isPending: boolean;
  isError: boolean;
  isFetching: boolean;
  sort: CompanySort;
  onSort: (sort: CompanySort) => void;
  onOpen: (id: string) => void;
  onRetry: () => void;
};

const COLUMN_COUNT = 4;
const SKELETON_ROWS = 5;
const cellClass = "px-3 py-2 text-left";

function ariaSort(sort: CompanySort, ascending: CompanySort) {
  if (sort === ascending) return "ascending";
  if (sort === `-${ascending}`) return "descending";
  return "none";
}

function MessageRow({ children }: { children: React.ReactNode }) {
  return (
    <tr>
      <td colSpan={COLUMN_COUNT} className="px-3 py-8 text-center text-sm">
        {children}
      </td>
    </tr>
  );
}

export function CompaniesTable({
  items,
  isPending,
  isError,
  isFetching,
  sort,
  onSort,
  onOpen,
  onRetry,
}: Props) {
  const { t, formatDate } = useI18n();

  function sortHeader(label: string, ascending: "name" | "created_at") {
    const descending = `-${ascending}` as const;
    const next = sort === ascending ? descending : ascending;
    return (
      <th
        scope="col"
        aria-sort={ariaSort(sort, ascending)}
        className={cellClass}
      >
        <button
          type="button"
          onClick={() => onSort(next)}
          className="font-semibold underline-offset-2 hover:underline"
        >
          {label}
        </button>
      </th>
    );
  }

  function renderBody() {
    if (isError) {
      return (
        <MessageRow>
          <p>{t.companies.loadError}</p>
          <button
            type="button"
            onClick={onRetry}
            className="mt-2 rounded-md border border-gray-300 px-3 py-1.5"
          >
            {t.companies.retry}
          </button>
        </MessageRow>
      );
    }
    if (isPending || !items) {
      return Array.from({ length: SKELETON_ROWS }, (_, row) => (
        <tr key={row} aria-hidden="true">
          {Array.from({ length: COLUMN_COUNT }, (_, cell) => (
            <td key={cell} className={cellClass}>
              <div className="h-4 animate-pulse rounded bg-gray-200" />
            </td>
          ))}
        </tr>
      ));
    }
    if (items.length === 0) return <MessageRow>{t.companies.empty}</MessageRow>;
    return items.map((company) => (
      <tr
        key={company.id}
        onClick={() => onOpen(company.id)}
        className="cursor-pointer border-t border-gray-200 hover:bg-gray-50"
      >
        <td className={cellClass}>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onOpen(company.id);
            }}
            className="font-medium underline-offset-2 hover:underline"
          >
            {company.name}
          </button>
        </td>
        <td className={cellClass}>{company.domain ?? t.table.noDomain}</td>
        <td className={cellClass}>{t.status[company.status]}</td>
        <td className={cellClass}>{formatDate(company.created_at)}</td>
      </tr>
    ));
  }

  return (
    <table className="w-full text-sm" aria-busy={isFetching}>
      <caption className="sr-only">{t.companies.title}</caption>
      <thead>
        <tr>
          {sortHeader(t.table.name, "name")}
          <th scope="col" className={cellClass}>
            {t.table.domain}
          </th>
          <th scope="col" className={cellClass}>
            {t.table.status}
          </th>
          {sortHeader(t.table.created, "created_at")}
        </tr>
      </thead>
      <tbody>{renderBody()}</tbody>
    </table>
  );
}
