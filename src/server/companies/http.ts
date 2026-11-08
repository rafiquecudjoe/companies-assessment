import type { ZodError } from "zod";

const MIN_DELAY_MS = 300;
const MAX_DELAY_MS = 800;

function simulateLatency(): Promise<void> {
  if (process.env.NODE_ENV === "test") return Promise.resolve();
  const ms = MIN_DELAY_MS + Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS);
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function hasBearerToken(request: Request): boolean {
  return /^Bearer\s+\S+$/.test(request.headers.get("authorization") ?? "");
}

export function errorResponse(status: number, detail: string): Response {
  return Response.json({ detail }, { status });
}

// FastAPI's 422 shape.
export function validationErrorResponse(error: ZodError): Response {
  const detail = error.issues.map((issue) => ({
    loc: ["body", ...issue.path],
    msg: issue.message,
    type: issue.code,
  }));
  return Response.json({ detail }, { status: 422 });
}

// An unreadable body becomes undefined, which the schemas reject with 422.
export async function readJsonBody(request: Request): Promise<unknown> {
  return request.json().catch(() => undefined);
}

export async function handleApi(
  request: Request,
  run: () => Response | Promise<Response>,
): Promise<Response> {
  await simulateLatency();
  if (!hasBearerToken(request)) return errorResponse(401, "Not authenticated");
  return run();
}
