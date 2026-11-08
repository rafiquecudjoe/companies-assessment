"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { setToken } from "@/lib/api/token-store";

export function SignInForm({ nextPath }: { nextPath: string }) {
  const router = useRouter();
  const [token, setTokenInput] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setToken(token.trim());
    router.replace(nextPath);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm font-medium">
        Access token
        <input
          value={token}
          onChange={(event) => setTokenInput(event.target.value)}
          required
          autoComplete="off"
          className="rounded border border-zinc-400 px-3 py-2 font-normal"
        />
      </label>
      <button type="submit" className="rounded bg-zinc-900 px-4 py-2 text-white">
        Sign in
      </button>
    </form>
  );
}
