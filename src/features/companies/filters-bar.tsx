"use client";

import { COMPANY_STATUSES } from "@/lib/api/schemas";
import type { CompanyStatus } from "@/lib/api/types.gen";
import { useI18n } from "@/lib/i18n/i18n-provider";

type Props = {
  q: string;
  status: CompanyStatus | null;
  onSearch: (q: string) => void;
  onStatus: (status: CompanyStatus | null) => void;
};

const fieldClass =
  "rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm";

export function FiltersBar({ q, status, onSearch, onStatus }: Props) {
  const { t } = useI18n();
  return (
    <div className="flex flex-wrap items-end gap-4">
      <label className="flex flex-col gap-1 text-sm">
        {t.companies.searchLabel}
        <input
          type="search"
          value={q}
          onChange={(event) => onSearch(event.target.value)}
          className={`${fieldClass} w-64`}
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        {t.companies.statusFilterLabel}
        <select
          value={status ?? ""}
          onChange={(event) =>
            onStatus(
              event.target.value ? (event.target.value as CompanyStatus) : null,
            )
          }
          className={fieldClass}
        >
          <option value="">{t.companies.allStatuses}</option>
          {COMPANY_STATUSES.map((value) => (
            <option key={value} value={value}>
              {t.status[value]}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
