import { vi } from "vitest";
import * as collectionRoute from "@/app/api/v1/companies/route";
import * as itemRoute from "@/app/api/v1/companies/[id]/route";

const ITEM_PATH = /^\/api\/v1\/companies\/([^/]+)$/;
const COLLECTION_PATH = "/api/v1/companies";

type Handler = (request: Request, context: { params: Promise<{ id: string }> }) => Response | Promise<Response>;

function pickHandler(module: Record<string, unknown>, method: string): Handler | undefined {
  return module[method] as Handler | undefined;
}

// Routes a fetch call to the real route handlers; relative URLs are accepted.
export async function apiFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const url = new URL(input instanceof Request ? input.url : String(input), "http://localhost");
  // Node's Request rejects jsdom's AbortSignal.
  const request = new Request(url, { ...init, signal: undefined });
  const id = ITEM_PATH.exec(url.pathname)?.[1];
  const route = id ? itemRoute : url.pathname === COLLECTION_PATH ? collectionRoute : undefined;
  const handler = route && pickHandler(route, request.method);
  if (!handler) return Response.json({ detail: "Not found" }, { status: 404 });
  return handler(request, { params: Promise.resolve({ id: id ?? "" }) });
}

export function stubApiFetch() {
  const fetchSpy = vi.fn(apiFetch);
  vi.stubGlobal("fetch", fetchSpy);
  return fetchSpy;
}
