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
const cellClass = "px-4 py-2.5 text-left";
const headerClass =
  "px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted";

const statusTone = {
  new: "bg-surface-muted text-muted",
  researching: "bg-surface-muted text-foreground",
  contacted: "bg-surface-muted text-foreground",
  qualified: "bg-surface-muted text-accent",
  rejected: "bg-surface-muted text-danger",
} as const;

function ariaSort(sort: CompanySort, ascending: CompanySort) {
  if (sort === ascending) return "ascending";
  if (sort === `-${ascending}`) return "descending";
  return "none";
}

function MessageRow({ children }: { children: React.ReactNode }) {
  return (
    <tr>
      <td
        colSpan={COLUMN_COUNT}
        className="px-4 py-10 text-left text-muted sm:text-center"
      >
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
    const direction = ariaSort(sort, ascending);
    return (
      <th scope="col" aria-sort={direction} className={headerClass}>
        <button
          type="button"
          onClick={() => onSort(next)}
          className="-mx-1 -my-1.5 rounded px-1 py-1.5 text-left uppercase hover:text-foreground"
        >
          {label}
          <span aria-hidden="true" className="ml-1">
            {direction === "ascending"
              ? "▲"
              : direction === "descending"
                ? "▼"
                : ""}
          </span>
        </button>
      </th>
    );
  }

  function renderBody() {
    if (isError) {
      return (
        <MessageRow>
          <p role="alert" className="text-danger">
            {t.companies.loadError}
          </p>
          <button type="button" onClick={onRetry} className="btn mt-3">
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
              <div className="h-4 animate-pulse rounded bg-surface-muted motion-reduce:animate-none" />
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
        className="cursor-pointer border-t border-line hover:bg-surface-muted"
      >
        <td className={cellClass}>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onOpen(company.id);
            }}
            className="rounded text-left font-medium underline-offset-2 hover:underline"
          >
            {company.name}
          </button>
        </td>
        <td className={`${cellClass} text-muted`}>
          {company.domain ?? t.table.noDomain}
        </td>
        <td className={cellClass}>
          <span
            className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${statusTone[company.status]}`}
          >
            {t.status[company.status]}
          </span>
        </td>
        <td className={`${cellClass} whitespace-nowrap tabular-nums text-muted`}>
          {formatDate(company.created_at)}
        </td>
      </tr>
    ));
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-line bg-surface">
      <table className="w-full min-w-[36rem] text-sm" aria-busy={isFetching}>
        <caption className="sr-only">{t.companies.title}</caption>
        <thead className="bg-surface-muted">
          <tr>
            {sortHeader(t.table.name, "name")}
            <th scope="col" className={headerClass}>
              {t.table.domain}
            </th>
            <th scope="col" className={headerClass}>
              {t.table.status}
            </th>
            {sortHeader(t.table.created, "created_at")}
          </tr>
        </thead>
        <tbody>{renderBody()}</tbody>
      </table>
    </div>
  );
}
