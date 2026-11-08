"use client";

import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { useState, type ReactNode } from "react";
import { ApiError } from "@/lib/api/errors";
import { clearToken } from "@/lib/api/token-store";
import { signInPath } from "@/lib/auth/safe-next";

function isClientError(error: unknown): boolean {
  return error instanceof ApiError && error.status >= 400 && error.status < 500;
}

function redirectOnUnauthorized(error: unknown): void {
  if (!(error instanceof ApiError) || error.status !== 401) return;
  clearToken();
  window.location.assign(
    signInPath(window.location.pathname + window.location.search),
  );
}

function createQueryClient(): QueryClient {
  return new QueryClient({
    queryCache: new QueryCache({ onError: redirectOnUnauthorized }),
    mutationCache: new MutationCache({ onError: redirectOnUnauthorized }),
    defaultOptions: {
      queries: {
        retry: (failureCount, error) =>
          !isClientError(error) && failureCount < 2,
      },
      mutations: { retry: false },
    },
  });
}

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(createQueryClient);
  return (
    <NuqsAdapter>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </NuqsAdapter>
  );
}
