import { z } from "zod";
import {
  apiRoutes,
  apiResultSchema,
  sessionResponseSchema,
  statusResultSchema,
  type ApiCommand,
  type ApiResult,
} from "./contracts";

export class KycApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}
async function decode<T>(response: Response, schema: z.ZodType<T>): Promise<T> {
  const result = await response.json().catch(() => null);
  if (!response.ok)
    throw new KycApiError(
      typeof result?.error === "string"
        ? result.error
        : "ارتباط با سرویس برقرار نشد. دوباره تلاش کنید.",
      response.status,
    );
  const parsed = schema.safeParse(result);
  if (!parsed.success)
    throw new KycApiError(
      "پاسخ سرویس معتبر نیست. دوباره تلاش کنید یا با پشتیبانی تماس بگیرید.",
      502,
    );
  return parsed.data;
}
export const kycApi = {
  session: async (signal?: AbortSignal) =>
    decode(
      await fetch(apiRoutes.session, { cache: "no-store", credentials: "same-origin", signal }),
      sessionResponseSchema,
    ),
  status: async (signal?: AbortSignal) =>
    decode(
      await fetch(apiRoutes.status, { cache: "no-store", credentials: "same-origin", signal }),
      statusResultSchema,
    ),
  submit: async ({ action, body }: ApiCommand, signal?: AbortSignal): Promise<ApiResult> => {
    const multipart = body instanceof FormData;
    return decode(
      await fetch(apiRoutes[action], {
        method: "POST",
        credentials: "same-origin",
        signal,
        headers: multipart ? undefined : { "Content-Type": "application/json" },
        body: multipart ? body : JSON.stringify(body),
      }),
      apiResultSchema,
    );
  },
};
