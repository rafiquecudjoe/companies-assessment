// Hand-written in the shape of an OpenAPI-generated types file.

export type CompanyStatus =
  "new" | "researching" | "contacted" | "qualified" | "rejected";

export type CompanySort = "name" | "-name" | "created_at" | "-created_at";

export type Company = {
  id: string;
  name: string;
  domain: string | null;
  status: CompanyStatus;
  version: number;
  created_at: string;
  updated_at: string;
};

export type ListCompaniesParams = {
  limit?: number;
  offset?: number;
  q?: string;
  status?: CompanyStatus;
  sort?: CompanySort;
};

export type CompanyList = {
  items: Company[];
  total: number;
  limit: number;
  offset: number;
};

export type CreateCompanyBody = {
  name: string;
  domain?: string | null;
  status?: CompanyStatus;
};

export type UpdateCompanyBody = {
  if_version: number;
  name?: string;
  domain?: string | null;
  status?: CompanyStatus;
};

export type ValidationErrorItem = {
  loc: (string | number)[];
  msg: string;
  type: string;
};

export type HttpValidationError = { detail: ValidationErrorItem[] };

export type HttpError = { detail: string };
