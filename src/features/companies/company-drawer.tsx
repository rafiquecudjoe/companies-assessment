"use client";

import { useCallback, useId, useRef } from "react";
import { useI18n } from "@/lib/i18n/i18n-provider";
import { CompanyForm } from "./company-form";
import { EditCompany } from "./edit-company";

export const PAGE_HEADING_ID = "companies-heading";

export const CREATE_ID = "new";

function focusHeadingIfNothingFocused() {
  // Opened from a shared link, nothing was focused before, so land on the heading.
  if (document.activeElement === document.body) {
    document.getElementById(PAGE_HEADING_ID)?.focus();
  }
}

type Props = {
  companyId: string | null;
  onClose: () => void;
  onCreated: () => void;
};

export function CompanyDrawer({ companyId, onClose, onCreated }: Props) {
  const { t } = useI18n();
  const titleId = useId();
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  // Stable on purpose: a new ref function each render would close and reopen the dialog.
  const attachDialog = useCallback((dialog: HTMLDialogElement | null) => {
    dialogRef.current = dialog;
    if (dialog && !dialog.open) dialog.showModal();
    // Removal through the URL (Back) skips close(), so close here to restore focus.
    return () => {
      if (dialog?.open) dialog.close();
      focusHeadingIfNothingFocused();
    };
  }, []);

  function handleClose() {
    focusHeadingIfNothingFocused();
    onClose();
  }

  function handleCreated() {
    onCreated();
    dialogRef.current?.close();
  }

  if (!companyId) return null;
  const isCreate = companyId === CREATE_ID;

  return (
    <dialog
      ref={attachDialog}
      aria-labelledby={titleId}
      onClose={handleClose}
      className="m-0 ml-auto h-dvh max-h-none w-full max-w-md bg-white p-6 text-gray-900 backdrop:bg-black/40"
    >
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 id={titleId} className="text-xl font-semibold">
          {isCreate ? t.drawer.createTitle : t.drawer.editTitle}
        </h2>
        <button
          type="button"
          onClick={() => dialogRef.current?.close()}
          className="rounded-md border border-gray-300 px-3 py-1.5"
        >
          {t.drawer.close}
        </button>
      </div>
      {isCreate ? (
        <CompanyForm company={null} onCreated={handleCreated} />
      ) : (
        <EditCompany id={companyId} />
      )}
    </dialog>
  );
}
