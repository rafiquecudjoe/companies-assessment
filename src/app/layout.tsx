import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { I18nProvider } from "@/lib/i18n/i18n-provider";
import { LOCALE_COOKIE, parseLocale } from "@/lib/i18n/locale";
import { LocaleToggle } from "@/lib/i18n/locale-toggle";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Companies",
  description: "Companies list and editor",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const cookieStore = await cookies();
  const locale = parseLocale(cookieStore.get(LOCALE_COOKIE)?.value);
  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <I18nProvider locale={locale} dictionary={getDictionary(locale)}>
          <header className="flex justify-end border-b border-line bg-surface px-4 py-2">
            <LocaleToggle />
          </header>
          <Providers>{children}</Providers>
        </I18nProvider>
      </body>
    </html>
  );
}
