"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import {
  companyListsQueryKey,
  createCompanyMutation,
  getCompanyQueryKey,
  updateCompanyMutation,
} from "@/lib/api/@tanstack/react-query.gen";
import { fieldErrors } from "@/lib/api/errors";
import { COMPANY_STATUSES, createCompanySchema } from "@/lib/api/schemas";
import type { Company, CompanyStatus } from "@/lib/api/types.gen";
import { useI18n } from "@/lib/i18n/i18n-provider";
import { FormField } from "./form-field";

type Draft = { name: string; domain: string; status: CompanyStatus };

type Props = {
  // Null means create mode.
  company: Company | null;
  onCreated?: () => void;
};

const emptyDraft: Draft = { name: "", domain: "", status: "new" };

const inputClass = "rounded-md border border-gray-300 px-3 py-2";

function draftFrom(company: Company): Draft {
  return {
    name: company.name,
    domain: company.domain ?? "",
    status: company.status,
  };
}

export function CompanyForm({ company, onCreated }: Props) {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const idPrefix = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const save = useMutation(updateCompanyMutation());
  const create = useMutation(createCompanyMutation());

  const [draft, setDraft] = useState(() =>
    company ? draftFrom(company) : emptyDraft,
  );
  const [baseVersion, setBaseVersion] = useState(company?.version ?? 0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [failedSubmits, setFailedSubmits] = useState(0);
  const [saveFailed, setSaveFailed] = useState(false);
  const [saved, setSaved] = useState(false);

  // Only a failed save moves focus, so typing never steals it.
  useEffect(() => {
    if (failedSubmits === 0) return;
    formRef.current
      ?.querySelector<HTMLElement>('[aria-invalid="true"]')
      ?.focus();
  }, [failedSubmits]);

  function changeField<Field extends keyof Draft>(
    field: Field,
    value: Draft[Field],
  ) {
    setDraft((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  function failWith(nextErrors: Record<string, string>) {
    setErrors(nextErrors);
    setFailedSubmits((count) => count + 1);
  }

  function invalidateLists() {
    void queryClient.invalidateQueries({ queryKey: companyListsQueryKey });
  }

  function handleSaveError(error: Error) {
    const apiErrors = fieldErrors(error);
    if (Object.keys(apiErrors).length > 0) failWith(apiErrors);
    else setSaveFailed(true);
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaved(false);
    setSaveFailed(false);
    setErrors({});

    const parsed = createCompanySchema.safeParse(draft);
    if (!parsed.success) {
      failWith({ name: t.drawer.nameRequired });
      return;
    }

    if (!company) {
      create.mutate(parsed.data, {
        onSuccess: () => {
          invalidateLists();
          onCreated?.();
        },
        onError: handleSaveError,
      });
      return;
    }

    save.mutate(
      { id: company.id, body: { if_version: baseVersion, ...parsed.data } },
      {
        onSuccess: (updated) => {
          queryClient.setQueryData(getCompanyQueryKey(updated.id), updated);
          invalidateLists();
          setDraft(draftFrom(updated));
          setBaseVersion(updated.version);
          setSaved(true);
        },
        onError: handleSaveError,
      },
    );
  }

  const isSaving = save.isPending || create.isPending;
  const hasFieldErrors = Object.keys(errors).length > 0;

  return (
    <form
      ref={formRef}
      noValidate
      onSubmit={handleSubmit}
      className="flex flex-col gap-4"
    >
      {hasFieldErrors && (
        <p role="alert" className="text-sm text-red-700">
          {t.drawer.validationSummary}
        </p>
      )}
      {saveFailed && (
        <p role="alert" className="text-sm text-red-700">
          {t.drawer.saveError}
        </p>
      )}
      <FormField
        id={`${idPrefix}-name`}
        label={t.drawer.nameLabel}
        error={errors.name}
      >
        {(controlProps) => (
          <input
            {...controlProps}
            value={draft.name}
            onChange={(event) => changeField("name", event.target.value)}
            className={inputClass}
          />
        )}
      </FormField>
      <FormField
        id={`${idPrefix}-domain`}
        label={t.drawer.domainLabel}
        error={errors.domain}
      >
        {(controlProps) => (
          <input
            {...controlProps}
            value={draft.domain}
            onChange={(event) => changeField("domain", event.target.value)}
            className={inputClass}
          />
        )}
      </FormField>
      <FormField
        id={`${idPrefix}-status`}
        label={t.drawer.statusLabel}
        error={errors.status}
      >
        {(controlProps) => (
          <select
            {...controlProps}
            value={draft.status}
            onChange={(event) =>
              changeField("status", event.target.value as CompanyStatus)
            }
            className={inputClass}
          >
            {COMPANY_STATUSES.map((status) => (
              <option key={status} value={status}>
                {t.status[status]}
              </option>
            ))}
          </select>
        )}
      </FormField>
      <button
        type="submit"
        disabled={isSaving}
        className="rounded-md bg-gray-900 px-3 py-2 text-white disabled:opacity-60"
      >
        {isSaving ? t.drawer.saving : t.drawer.save}
      </button>
      <p role="status" className="text-sm">
        {saved ? t.drawer.saved : ""}
      </p>
    </form>
  );
}
