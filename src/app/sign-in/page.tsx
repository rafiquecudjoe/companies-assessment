import { safeNextPath } from "@/lib/auth/safe-next";
import { SignInForm } from "./sign-in-form";

export default async function SignInPage({ searchParams }: PageProps<"/sign-in">) {
  const { next } = await searchParams;
  return (
    <main className="mx-auto flex w-full max-w-sm flex-col gap-6 p-6">
      <h1 className="text-2xl font-semibold">Sign in</h1>
      <SignInForm nextPath={safeNextPath(typeof next === "string" ? next : undefined)} />
    </main>
  );
}
