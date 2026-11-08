"use client";

import { useI18n } from "@/lib/i18n/i18n-provider";

type Props = {
  page: number;
  pageSize: number;
  total: number;
  onPage: (page: number) => void;
};

const buttonClass =
  "rounded-md border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-50";

export function Pagination({ page, pageSize, total, onPage }: Props) {
  const { t, format } = useI18n();
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  return (
    <nav
      aria-label={t.pagination.label}
      className="flex items-center justify-between"
    >
      <p className="text-sm">
        {format(t.pagination.summary, { from, to, total })}
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          className={buttonClass}
          disabled={page <= 1}
          onClick={() => onPage(page - 1)}
        >
          {t.pagination.previous}
        </button>
        <button
          type="button"
          className={buttonClass}
          disabled={to >= total}
          onClick={() => onPage(page + 1)}
        >
          {t.pagination.next}
        </button>
      </div>
    </nav>
  );
}
