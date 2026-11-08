import { createCompanySchema, listParamsSchema } from "@/lib/api/schemas";
import { listCompanies } from "@/server/companies/list";
import { handleApi, readJsonBody, validationErrorResponse } from "@/server/companies/http";
import { createCompany, getAllCompanies } from "@/server/companies/store";

export function GET(request: Request) {
  return handleApi(request, () => {
    const query = Object.fromEntries(new URL(request.url).searchParams);
    return Response.json(listCompanies(getAllCompanies(), listParamsSchema.parse(query)));
  });
}

export function POST(request: Request) {
  return handleApi(request, async () => {
    const parsed = createCompanySchema.safeParse(await readJsonBody(request));
    if (!parsed.success) return validationErrorResponse(parsed.error);
    return Response.json(createCompany(parsed.data), { status: 201 });
  });
}
