"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import {
  companyListsQueryKey,
  createCompanyMutation,
  getCompanyQueryKey,
  updateCompanyMutation,
} from "@/lib/api/@tanstack/react-query.gen";
import { ApiError, fieldErrors } from "@/lib/api/errors";
import { COMPANY_STATUSES, createCompanySchema } from "@/lib/api/schemas";
import type { Company, CompanyStatus } from "@/lib/api/types.gen";
import { useI18n } from "@/lib/i18n/i18n-provider";
import { FormField } from "./form-field";

type Draft = { name: string; domain: string; status: CompanyStatus };

type Props = {
  // Null means create mode.
  company: Company | null;
  onCreated?: () => void;
  // Refetches the company; undefined when that fails.
  onLoadLatest?: () => Promise<Company | undefined>;
};

const emptyDraft: Draft = { name: "", domain: "", status: "new" };

const inputClass = "field";

function changedFields(
  draft: Draft,
  latest: Company,
): Record<keyof Draft, boolean> {
  return {
    name: draft.name.trim() !== latest.name,
    domain: (draft.domain.trim() || null) !== latest.domain,
    status: draft.status !== latest.status,
  };
}

function draftFrom(company: Company): Draft {
  return {
    name: company.name,
    domain: company.domain ?? "",
    status: company.status,
  };
}

export function CompanyForm({ company, onCreated, onLoadLatest }: Props) {
  const { t, format } = useI18n();
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
  const [conflict, setConflict] = useState(false);
  const [latest, setLatest] = useState<Company | null>(null);
  const [saved, setSaved] = useState(false);
  const [isLoadingLatest, setIsLoadingLatest] = useState(false);

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
    if (error instanceof ApiError && error.status === 409) {
      setConflict(true);
      return;
    }
    const apiErrors = fieldErrors(error);
    if (Object.keys(apiErrors).length > 0) failWith(apiErrors);
    else setSaveFailed(true);
  }

  // The draft stays as typed; only the version we send and the hints change.
  async function handleLoadLatest() {
    setIsLoadingLatest(true);
    const fresh = await onLoadLatest?.();
    setIsLoadingLatest(false);
    if (!fresh) {
      setSaveFailed(true);
      return;
    }
    setBaseVersion(fresh.version);
    setLatest(fresh);
    setConflict(false);
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaved(false);
    setSaveFailed(false);
    setConflict(false);
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
          setLatest(null);
          setSaved(true);
        },
        onError: handleSaveError,
      },
    );
  }

  const isSaving = save.isPending || create.isPending;
  const changed = latest ? changedFields(draft, latest) : null;
  const latestHint = (field: keyof Draft, value: string) =>
    changed?.[field] ? format(t.conflict.latestSaved, { value }) : undefined;
  const hasFieldErrors = Object.keys(errors).length > 0;

  return (
    <form
      ref={formRef}
      noValidate
      onSubmit={handleSubmit}
      className="flex flex-col gap-4"
    >
      {hasFieldErrors && (
        <p role="alert" className="text-sm text-danger">
          {t.drawer.validationSummary}
        </p>
      )}
      {conflict && (
        <div
          role="alert"
          className="flex flex-col items-start gap-2 rounded-md border border-notice bg-surface-muted p-3 text-sm"
        >
          <p>{t.conflict.message}</p>
          {onLoadLatest && (
            <button
              type="button"
              onClick={() => void handleLoadLatest()}
              disabled={isLoadingLatest}
              className="btn"
            >
              {t.conflict.loadLatest}
            </button>
          )}
        </div>
      )}
      {saveFailed && (
        <p role="alert" className="text-sm text-danger">
          {t.drawer.saveError}
        </p>
      )}
      <FormField
        id={`${idPrefix}-name`}
        label={t.drawer.nameLabel}
        error={errors.name}
        hint={latest ? latestHint("name", latest.name) : undefined}
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
        hint={
          latest
            ? latestHint("domain", latest.domain ?? t.table.noDomain)
            : undefined
        }
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
        hint={
          latest ? latestHint("status", t.status[latest.status]) : undefined
        }
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
        disabled={isSaving || isLoadingLatest}
        className="btn btn-primary"
      >
        {isSaving ? t.drawer.saving : t.drawer.save}
      </button>
      <p role="status" className="min-h-5 text-sm font-medium">
        {saved ? t.drawer.saved : ""}
      </p>
    </form>
  );
}
