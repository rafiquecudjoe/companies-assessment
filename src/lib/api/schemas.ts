import { z } from "zod";

// One set of rules for the route handlers and the form.

export const COMPANY_STATUSES = [
  "new",
  "researching",
  "contacted",
  "qualified",
  "rejected",
] as const;
export const COMPANY_SORTS = [
  "name",
  "-name",
  "created_at",
  "-created_at",
] as const;

export const LIST_DEFAULTS = {
  limit: 20,
  offset: 0,
  sort: "-created_at",
} as const;

export const companyStatusSchema = z.enum(COMPANY_STATUSES);

const nameSchema = z.string().trim().min(1, "Name is required");
const domainSchema = z
  .string()
  .trim()
  .transform((value) => value || null)
  .nullable();

export const createCompanySchema = z.object({
  name: nameSchema,
  domain: domainSchema.optional(),
  status: companyStatusSchema.optional(),
});

export const updateCompanySchema = z.object({
  if_version: z.number().int(),
  name: nameSchema.optional(),
  domain: domainSchema.optional(),
  status: companyStatusSchema.optional(),
});

// Bad query values fall back to the defaults instead of failing.
export const listParamsSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).catch(LIST_DEFAULTS.limit),
  offset: z.coerce.number().int().min(0).catch(LIST_DEFAULTS.offset),
  q: z.string().trim().catch(""),
  status: companyStatusSchema.optional().catch(undefined),
  sort: z.enum(COMPANY_SORTS).catch(LIST_DEFAULTS.sort),
});

export type ListParams = z.infer<typeof listParamsSchema>;
