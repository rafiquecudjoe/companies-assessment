"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { Dictionary } from "./dictionary";
import { formatDate } from "./format";
import type { Locale } from "./locale";

type I18n = {
  locale: Locale;
  t: Dictionary;
  formatDate: (iso: string) => string;
};

const I18nContext = createContext<I18n | null>(null);

export function I18nProvider({
  locale,
  dictionary,
  children,
}: {
  locale: Locale;
  dictionary: Dictionary;
  children: ReactNode;
}) {
  const value = useMemo<I18n>(
    () => ({
      locale,
      t: dictionary,
      formatDate: (iso) => formatDate(iso, locale),
    }),
    [locale, dictionary],
  );
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18n {
  const value = useContext(I18nContext);
  if (!value) throw new Error("useI18n must be used inside I18nProvider");
  return value;
}
