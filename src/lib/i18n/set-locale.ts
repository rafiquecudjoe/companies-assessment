"use server";

import { cookies } from "next/headers";
import { LOCALE_COOKIE, parseLocale } from "./locale";

// The cookie change makes Next re-render the current page in the new language.
export async function setLocale(locale: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(LOCALE_COOKIE, parseLocale(locale), {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
}
