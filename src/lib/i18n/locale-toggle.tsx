"use client";

import { useTransition } from "react";
import { useI18n } from "./i18n-provider";
import { LOCALES } from "./locale";
import { setLocale } from "./set-locale";

export function LocaleToggle() {
  const { locale, t } = useI18n();
  const [isPending, startTransition] = useTransition();

  return (
    <div
      role="group"
      aria-label={t.language}
      className="flex overflow-hidden rounded-md border border-line-strong"
      aria-busy={isPending}
    >
      {LOCALES.map((option) => (
        <button
          key={option}
          type="button"
          aria-pressed={option === locale}
          onClick={() => startTransition(() => setLocale(option))}
          className="px-2.5 py-1 text-xs font-medium uppercase text-muted hover:bg-surface-muted aria-pressed:bg-accent aria-pressed:text-accent-contrast aria-pressed:hover:bg-accent focus-visible:-outline-offset-2"
        >
          {option}
        </button>
      ))}
    </div>
  );
}
