import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import { NuqsTestingAdapter, type OnUrlUpdateFunction } from "nuqs/adapters/testing";
import { CompaniesView } from "@/features/companies/companies-view";
import { setToken } from "@/lib/api/token-store";
import { en } from "@/lib/i18n/en";
import { I18nProvider } from "@/lib/i18n/i18n-provider";

// Fresh client per render, no retries, so failures show up at once.
export function renderCompanies(searchParams = "", onUrlUpdate?: OnUrlUpdateFunction) {
  setToken("test-token");
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <NuqsTestingAdapter searchParams={searchParams} hasMemory onUrlUpdate={onUrlUpdate}>
      <QueryClientProvider client={queryClient}>
        <I18nProvider locale="en" dictionary={en}>
          <CompaniesView />
        </I18nProvider>
      </QueryClientProvider>
    </NuqsTestingAdapter>,
  );
}
