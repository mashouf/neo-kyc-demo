import { handleDemoAction } from "./server-actions";
import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAME, HttpError, sessionRecord, verificationStatus } from "./server";
import { apiRoutes, type ApiAction } from "./contracts";

const writes: Record<string, ApiAction> = {
  [apiRoutes["personal-info"]]: "personal-info",
  [apiRoutes.address]: "address",
  [apiRoutes["account-type"]]: "account-type",
  [apiRoutes.submit]: "submit",
  [apiRoutes.documents]: "documents",
  [apiRoutes.liveness]: "liveness",
  [apiRoutes["send-otp"]]: "send-otp",
  [apiRoutes["verify-otp"]]: "verify-otp",
  [apiRoutes.edit]: "edit",
  [apiRoutes.restart]: "restart",
};
const legacySessionPath = "/api/onboarding/session";
function fail(error: unknown) {
  return NextResponse.json(
    {
      error:
        error instanceof HttpError ? error.message : "پردازش درخواست ممکن نیست. دوباره تلاش کنید.",
    },
    {
      status: error instanceof HttpError ? error.status : 500,
      headers: { "Cache-Control": "no-store" },
    },
  );
}
function response(data: unknown, id: string) {
  const result = NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
  result.cookies.set(COOKIE_NAME, id, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    // Shared by /api/onboarding, /api/ekyc and the existing OTP endpoints.
    path: "/api",
    maxAge: 30 * 60,
  });
  return result;
}
export async function readRoute(request: NextRequest) {
  try {
    const path = request.nextUrl.pathname;
    const isStepSession = path === apiRoutes.session;
    const isSession = path === legacySessionPath || isStepSession;
    const isStatus = path === apiRoutes.status;
    if (!isSession && !isStatus)
      throw new HttpError(
        Object.hasOwn(writes, path) ? 405 : 404,
        "این عملیات برای این مسیر در دسترس نیست",
      );
    const { id, record, fresh } = sessionRecord(request.cookies.get(COOKIE_NAME)?.value);
    if (isStatus && fresh)
      throw new HttpError(401, "نشست شما منقضی شده است. صفحه را تازه‌سازی کنید.");
    if (isStepSession) {
      // These two transient UI states resume through their associated API step.
      const mapping = {
        mobile: "otp",
        otp: "otp",
        "personal-info": "personal_info",
        address: "address",
        "account-type": "account_type",
        documents: "document",
        liveness: "liveness",
        verification: "liveness",
        review: "review",
        complete: "review",
      } as const;
      if (record.session.stage === "mobile") record.session.stage = "otp";
      const { stage, ...details } = record.session;
      return response({ ...details, step: mapping[stage as keyof typeof mapping] }, id);
    }
    return response(isStatus ? verificationStatus(record) : { session: record.session }, id);
  } catch (error) {
    return fail(error);
  }
}
export async function writeRoute(request: NextRequest) {
  let unlock: (() => void) | undefined;
  try {
    const origin = request.headers.get("origin");
    if (origin && origin !== new URL(request.url).origin)
      throw new HttpError(403, "مبدأ درخواست مجاز نیست");
    // Own-property lookup prevents prototype keys from becoming actions.
    const path = request.nextUrl.pathname;
    const action = Object.hasOwn(writes, path) ? writes[path] : undefined;
    if (!action)
      throw new HttpError(
        [apiRoutes.session, legacySessionPath, apiRoutes.status].includes(path) ? 405 : 404,
        "این عملیات برای این مسیر در دسترس نیست",
      );
    const { id, record, fresh } = sessionRecord(request.cookies.get(COOKIE_NAME)?.value);
    if (fresh) throw new HttpError(401, "نشست شما منقضی شده است. صفحه را تازه‌سازی کنید.");
    if (record.busy) throw new HttpError(409, "درخواست دیگری در حال پردازش است. دوباره تلاش کنید.");
    record.busy = true;
    unlock = () => {
      record.busy = false;
    };
    const maxBytes = action === "documents" || action === "liveness" ? 11 * 1024 * 1024 : 16 * 1024;
    const reader = request.body?.getReader();
    if (!reader) throw new HttpError(400, "محتوای درخواست لازم است");
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) {
        await reader.cancel();
        throw new HttpError(413, "حجم فایل بیش از حد مجاز است");
      }
      chunks.push(value);
    }
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.byteLength;
    }
    const contentType = request.headers.get("content-type") ?? "";
    let body: unknown;
    try {
      if (contentType.startsWith("multipart/form-data"))
        body = await new Response(bytes, { headers: { "Content-Type": contentType } }).formData();
      else if (contentType.startsWith("application/json"))
        body = JSON.parse(new TextDecoder().decode(bytes));
      else throw new HttpError(415, "درخواست باید به صورت JSON یا داده چندبخشی ارسال شود");
    } catch (error) {
      if (error instanceof HttpError) throw error;
      throw new HttpError(400, "محتوای درخواست معتبر نیست");
    }
    return response(await handleDemoAction(record, action, body), id);
  } catch (error) {
    return fail(error);
  } finally {
    unlock?.();
  }
}
