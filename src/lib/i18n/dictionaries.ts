import { en } from "./en";
import { nl } from "./nl";
import type { Dictionary } from "./dictionary";
import type { Locale } from "./locale";

const dictionaries: Record<Locale, Dictionary> = { en, nl };

export const getDictionary = (locale: Locale): Dictionary =>
  dictionaries[locale];
