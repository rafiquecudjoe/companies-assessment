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
    <main className="mx-auto flex w-full max-w-sm flex-col gap-6 p-6">
      <h1 className="text-2xl font-semibold">{t.signIn.title}</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm font-medium">
          {t.signIn.tokenLabel}
          <input
            value={token}
            onChange={(event) => setTokenInput(event.target.value)}
            required
            autoComplete="off"
            className="rounded border border-zinc-400 px-3 py-2 font-normal"
          />
        </label>
        <button
          type="submit"
          className="rounded bg-zinc-900 px-4 py-2 text-white"
        >
          {t.signIn.submit}
        </button>
      </form>
    </main>
  );
}
