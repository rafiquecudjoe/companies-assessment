import { updateCompanySchema } from "@/lib/api/schemas";
import {
  errorResponse,
  handleApi,
  readJsonBody,
  validationErrorResponse,
} from "@/server/companies/http";
import { findCompany, updateCompany } from "@/server/companies/store";

type RouteContext = { params: Promise<{ id: string }> };

export function GET(request: Request, { params }: RouteContext) {
  return handleApi(request, async () => {
    const company = findCompany((await params).id);
    return company
      ? Response.json(company)
      : errorResponse(404, "Company not found");
  });
}

// Check order: auth, 404, 422, 409.
export function PATCH(request: Request, { params }: RouteContext) {
  return handleApi(request, async () => {
    const { id } = await params;
    if (!findCompany(id)) return errorResponse(404, "Company not found");
    const parsed = updateCompanySchema.safeParse(await readJsonBody(request));
    if (!parsed.success) return validationErrorResponse(parsed.error);
    const { if_version, ...changes } = parsed.data;
    // No await below: the version check and the write must not interleave.
    const company = findCompany(id);
    if (!company) return errorResponse(404, "Company not found");
    if (if_version !== company.version)
      return errorResponse(409, "Company was changed by someone else");
    return Response.json(updateCompany(company, changes));
  });
}
