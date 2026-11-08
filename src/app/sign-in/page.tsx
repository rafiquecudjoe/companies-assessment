import { safeNextPath } from "@/lib/auth/safe-next";
import { SignInForm } from "./sign-in-form";

export default async function SignInPage({
  searchParams,
}: PageProps<"/sign-in">) {
  const { next } = await searchParams;
  return (
    <SignInForm
      nextPath={safeNextPath(typeof next === "string" ? next : undefined)}
    />
  );
}
