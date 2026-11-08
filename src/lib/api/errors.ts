import { z } from "zod";

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly body: unknown,
  ) {
    super(`API request failed with status ${status}`);
    this.name = "ApiError";
  }
}

const validationBodySchema = z.object({
  detail: z.array(
    z.object({
      loc: z.array(z.union([z.string(), z.number()])),
      msg: z.string(),
    }),
  ),
});

// Maps a 422 body to { field: message }; the first message per field wins.
export function fieldErrors(error: unknown): Record<string, string> {
  if (!(error instanceof ApiError) || error.status !== 422) return {};
  const parsed = validationBodySchema.safeParse(error.body);
  if (!parsed.success) return {};
  const errors: Record<string, string> = {};
  for (const item of parsed.data.detail) {
    errors[item.loc.slice(1).join(".")] ??= item.msg;
  }
  return errors;
}
