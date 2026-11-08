const DEFAULT_PATH = "/companies";

// Only same-site paths: "//host" and "/\host" are treated as other sites by browsers.
export function safeNextPath(next: string | undefined): string {
  if (
    !next ||
    !next.startsWith("/") ||
    next.startsWith("//") ||
    next.includes("\\")
  ) {
    return DEFAULT_PATH;
  }
  return next;
}

export function signInPath(currentPath: string): string {
  return `/sign-in?next=${encodeURIComponent(currentPath)}`;
}
