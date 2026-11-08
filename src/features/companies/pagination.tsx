"use client";

import { interpolate } from "@/lib/i18n/format";
import { useI18n } from "@/lib/i18n/i18n-provider";

type Props = {
  page: number;
  pageSize: number;
  total: number;
  onPage: (page: number) => void;
};

const buttonClass = "btn";

export function Pagination({ page, pageSize, total, onPage }: Props) {
  const { t } = useI18n();
  const offset = (page - 1) * pageSize;
  // A hand-edited page past the end shows "0 to 0" instead of "1961 to 40".
  const from = offset >= total ? 0 : offset + 1;
  const to = from === 0 ? 0 : Math.min(page * pageSize, total);
  return (
    <nav
      aria-label={t.pagination.label}
      className="flex items-center justify-between gap-4"
    >
      <p role="status" className="text-sm tabular-nums text-muted">
        {interpolate(t.pagination.summary, { from, to, total })}
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
