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
      className="flex gap-1"
      aria-busy={isPending}
    >
      {LOCALES.map((option) => (
        <button
          key={option}
          type="button"
          aria-pressed={option === locale}
          onClick={() => startTransition(() => setLocale(option))}
          className="rounded border border-zinc-400 px-2 py-1 text-sm uppercase aria-pressed:bg-zinc-900 aria-pressed:text-white"
        >
          {option}
        </button>
      ))}
    </div>
  );
}
