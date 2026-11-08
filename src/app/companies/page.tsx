import { Suspense } from "react";
import { CompaniesView } from "@/features/companies/companies-view";

export default function CompaniesPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 pb-12">
      <Suspense fallback={null}>
        <CompaniesView />
      </Suspense>
    </main>
  );
}
