import { ApiError } from "./errors";
import { getToken } from "./token-store";
import type {
  Company,
  CompanyList,
  CreateCompanyBody,
  ListCompaniesParams,
  UpdateCompanyBody,
} from "./types.gen";

const BASE_PATH = "/api/v1/companies";

type RequestOptions = { signal?: AbortSignal };

function buildQueryString(params: ListCompaniesParams): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") query.set(key, String(value));
  }
  const text = query.toString();
  return text ? `?${text}` : "";
}

async function request<Response>(
  path: string,
  { method = "GET", body, signal }: RequestOptions & { method?: string; body?: unknown } = {},
): Promise<Response> {
  const token = getToken();
  const response = await fetch(path, {
    method,
    signal,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(body === undefined ? {} : { "Content-Type": "application/json" }),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!response.ok) throw new ApiError(response.status, await response.json().catch(() => null));
  return (await response.json()) as Response;
}

export function listCompanies(params: ListCompaniesParams = {}, options: RequestOptions = {}) {
  return request<CompanyList>(`${BASE_PATH}${buildQueryString(params)}`, options);
}

export function getCompany(id: string, options: RequestOptions = {}) {
  return request<Company>(`${BASE_PATH}/${encodeURIComponent(id)}`, options);
}

export function createCompany(body: CreateCompanyBody, options: RequestOptions = {}) {
  return request<Company>(BASE_PATH, { ...options, method: "POST", body });
}

export function updateCompany(id: string, body: UpdateCompanyBody, options: RequestOptions = {}) {
  return request<Company>(`${BASE_PATH}/${encodeURIComponent(id)}`, { ...options, method: "PATCH", body });
}
