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
  const offset = (page - 1) * pageSize;
  // A hand-edited page past the end shows "0 to 0" instead of "1961 to 40".
  const from = offset >= total ? 0 : offset + 1;
  const to = from === 0 ? 0 : Math.min(page * pageSize, total);
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
          disabled={page * pageSize >= total}
          onClick={() => onPage(page + 1)}
        >
          {t.pagination.next}
        </button>
      </div>
    </nav>
  );
}
