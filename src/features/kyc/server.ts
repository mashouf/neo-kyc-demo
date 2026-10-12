import "server-only";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { MAX_DOCUMENT_BYTES, type KycSession, type Stage, type StatusResult } from "./contracts";

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export type RecordState = {
  session: KycSession;
  expiresAt: number;
  attempts: number;
  otp?: string;
  otpExpiresAt?: number;
  resendAt?: number;
  sends: number;
  busy?: boolean;
  verificationReadyAt?: number;
};
// Process-local demo storage. Changing the key starts fresh sessions after the API migration.
const globalStore = globalThis as typeof globalThis & {
  onboardingDemoSessions?: Map<string, RecordState>;
};
const sessions = (globalStore.onboardingDemoSessions ??= new Map());
const ttl = 30 * 60 * 1000;
export const COOKIE_NAME = "onboarding_demo_session";
export function isDemoEnabled() {
  return process.env.NODE_ENV !== "production" || process.env.KYC_DEMO_MODE === "true";
}
export function sessionRecord(id?: string) {
  if (!isDemoEnabled())
    throw new HttpError(
      503,
      "KYC provider is not configured. Set KYC_DEMO_MODE=true only for a demo deployment.",
    );
  const now = Date.now();
  for (const [key, value] of sessions) if (value.expiresAt < now) sessions.delete(key);
  const existing = id ? sessions.get(id) : undefined;
  if (existing) return { id: id!, record: existing, fresh: false };
  if (sessions.size >= 1000)
    throw new HttpError(503, "ظرفیت نشست‌ها تکمیل شده است. بعداً تلاش کنید.");
  const key = randomUUID();
  const record: RecordState = {
    session: { stage: "mobile", mode: "demo" },
    expiresAt: now + ttl,
    attempts: 0,
    sends: 0,
  };
  sessions.set(key, record);
  return { id: key, record, fresh: true };
}
export function expectStage(record: RecordState, ...allowed: Stage[]) {
  if (!allowed.includes(record.session.stage))
    throw new HttpError(
      409,
      "این مرحله در دسترس نیست. برای هماهنگ‌سازی نشست، صفحه را تازه‌سازی کنید.",
    );
}
export function parse<T>(schema: z.ZodType<T>, data: unknown): T {
  const parsed = schema.safeParse(data);
  if (!parsed.success)
    throw new HttpError(422, parsed.error.issues.map((issue) => issue.message).join(". "));
  return parsed.data;
}
export async function document(file: FormDataEntryValue | null, label: string) {
  if (!(file instanceof File) || !file.size)
    throw new HttpError(
      422,
      `تصویر ${label === "front" ? "روی" : "پشت"} مدرک شناسایی را انتخاب کنید`,
    );
  if (file.size > MAX_DOCUMENT_BYTES)
    throw new HttpError(422, "حجم هر مدرک باید حداکثر ۵ مگابایت باشد");
  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const jpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  const png = [137, 80, 78, 71, 13, 10, 26, 10].every((value, index) => bytes[index] === value);
  const pdf = String.fromCharCode(...bytes.slice(0, 5)) === "%PDF-";
  if (!(
    (file.type === "image/jpeg" && jpeg) ||
    (file.type === "image/png" && png) ||
    (file.type === "application/pdf" && pdf)
  ))
    throw new HttpError(422, "یک فایل معتبر JPEG، PNG یا PDF ارسال کنید");
  return file.name.slice(0, 120);
}
export function verificationStatus(record: RecordState): StatusResult {
  expectStage(record, "verification", "review", "complete");
  const pending = record.session.verification?.status === "pending";
  if (
    pending &&
    record.verificationReadyAt &&
    Date.now() >= record.verificationReadyAt &&
    !record.busy
  ) {
    const configured = process.env.KYC_DEMO_EKYC_RESULT;
    const status =
      configured === "rejected" || configured === "manual_review" ? configured : "approved";
    const reason =
      status === "rejected"
        ? "احراز هویت نیاز به تلاش دوباره دارد. مدارک را دوباره ارسال کنید."
        : status === "manual_review"
          ? "درخواست شما در انتظار بررسی کارشناسی است."
          : undefined;
    record.session = {
      ...record.session,
      stage: status === "approved" ? "review" : "verification",
      verification: { status, reason },
    };
  }
  const verification = record.session.verification;
  if (!verification) throw new HttpError(409, "ابتدا مدارک احراز هویت را ارسال کنید");
  return {
    session: record.session,
    verification,
    message:
      verification.status === "approved"
        ? "پاسخ بررسی محلی دریافت شد. تحلیل هویت یا اطلاعات زیست‌سنجی انجام نشده است."
        : verification.reason,
  };
}
