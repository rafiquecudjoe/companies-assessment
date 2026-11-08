"use client";

import { useCallback, useId, useRef } from "react";
import { useI18n } from "@/lib/i18n/i18n-provider";
import { EditCompany } from "./edit-company";

export const PAGE_HEADING_ID = "companies-heading";

type Props = {
  companyId: string | null;
  onClose: () => void;
};

export function CompanyDrawer({ companyId, onClose }: Props) {
  const { t } = useI18n();
  const titleId = useId();
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  // Stable on purpose: a new ref function each render would close and reopen the dialog.
  const attachDialog = useCallback((dialog: HTMLDialogElement | null) => {
    dialogRef.current = dialog;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  function handleClose() {
    // Opened from a shared link, nothing was focused before, so land on the heading.
    if (document.activeElement === document.body) {
      document.getElementById(PAGE_HEADING_ID)?.focus();
    }
    onClose();
  }

  if (!companyId) return null;

  return (
    <dialog
      ref={attachDialog}
      aria-labelledby={titleId}
      onClose={handleClose}
      className="m-0 ml-auto h-dvh max-h-none w-full max-w-md bg-white p-6 text-gray-900 backdrop:bg-black/40"
    >
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 id={titleId} className="text-xl font-semibold">
          {t.drawer.editTitle}
        </h2>
        <button
          type="button"
          onClick={() => dialogRef.current?.close()}
          className="rounded-md border border-gray-300 px-3 py-1.5"
        >
          {t.drawer.close}
        </button>
      </div>
      <EditCompany id={companyId} />
    </dialog>
  );
}
