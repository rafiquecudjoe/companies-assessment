"use client";

import { useQuery } from "@tanstack/react-query";
import { getCompanyOptions } from "@/lib/api/@tanstack/react-query.gen";
import { ApiError } from "@/lib/api/errors";
import { useI18n } from "@/lib/i18n/i18n-provider";
import { CompanyForm } from "./company-form";

export function EditCompany({ id }: { id: string }) {
  const { t } = useI18n();
  const { data, error, isPending, refetch } = useQuery(getCompanyOptions(id));

  if (isPending) return <p role="status">{t.drawer.loading}</p>;
  if (error) {
    const missing = error instanceof ApiError && error.status === 404;
    return (
      <div role="alert" className="flex flex-col items-start gap-2">
        <p>{missing ? t.drawer.notFound : t.drawer.loadError}</p>
        {!missing && (
          <button
            type="button"
            onClick={() => void refetch()}
            className="rounded-md border border-gray-300 px-3 py-1.5"
          >
            {t.companies.retry}
          </button>
        )}
      </div>
    );
  }
  return (
    <CompanyForm
      key={id}
      company={data}
      onLoadLatest={async () => {
        const result = await refetch();
        return result.isError ? undefined : result.data;
      }}
    />
  );
}
