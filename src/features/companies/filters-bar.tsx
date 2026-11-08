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

const fieldClass = "field";

export function FiltersBar({ q, status, onSearch, onStatus }: Props) {
  const { t } = useI18n();
  return (
    <div className="flex flex-wrap items-end gap-3">
      <label className="flex w-full flex-col gap-1.5 text-sm font-medium sm:w-auto">
        {t.companies.searchLabel}
        <input
          type="search"
          value={q}
          onChange={(event) => onSearch(event.target.value)}
          className={`${fieldClass} w-full sm:w-64 font-normal`}
        />
      </label>
      <label className="flex w-full flex-col gap-1.5 text-sm font-medium sm:w-auto">
        {t.companies.statusFilterLabel}
        <select
          value={status ?? ""}
          onChange={(event) =>
            onStatus(
              event.target.value ? (event.target.value as CompanyStatus) : null,
            )
          }
          className={`${fieldClass} font-normal`}
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
