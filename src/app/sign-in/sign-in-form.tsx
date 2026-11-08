"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { setToken } from "@/lib/api/token-store";
import { useI18n } from "@/lib/i18n/i18n-provider";

export function SignInForm({ nextPath }: { nextPath: string }) {
  const router = useRouter();
  const { t } = useI18n();
  const [token, setTokenInput] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setToken(token.trim());
    router.replace(nextPath);
  }

  return (
    <main className="mx-4 mt-12 flex max-w-sm sm:mx-auto flex-col gap-6 rounded-lg border border-line bg-surface p-6 shadow-sm sm:mt-24">
      <h1 className="text-xl font-semibold tracking-tight">{t.signIn.title}</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          {t.signIn.tokenLabel}
          <input
            value={token}
            onChange={(event) => setTokenInput(event.target.value)}
            required
            autoComplete="off"
            className="field font-normal"
          />
        </label>
        <button type="submit" className="btn btn-primary">
          {t.signIn.submit}
        </button>
      </form>
    </main>
  );
}
