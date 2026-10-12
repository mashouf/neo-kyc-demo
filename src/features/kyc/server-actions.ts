import "server-only";
import { randomUUID } from "node:crypto";
import {
  accountTypeSchema,
  addressSchema,
  personalInfoSchema,
  submitSchema,
  MAX_VIDEO_BYTES,
  type ApiAction,
  type ApiResult,
} from "./contracts";
import { HttpError, expectStage, parse, document, type RecordState } from "./server";
import { handleOtpAction } from "./server-otp";

export async function handleDemoAction(
  record: RecordState,
  action: ApiAction,
  body: unknown,
): Promise<ApiResult> {
  if (action === "send-otp" || action === "verify-otp")
    return handleOtpAction(record, action, body);
  let message: string | undefined;
  switch (action) {
    case "personal-info": {
      expectStage(record, "personal-info");
      const personalInfo = parse(personalInfoSchema, body);
      record.verificationReadyAt = undefined;
      record.session = {
        stage: "address",
        mode: "demo",
        mobile: record.session.mobile,
        personalInfo,
        address: record.session.address,
        accountType: record.session.accountType,
      };
      break;
    }
    case "address": {
      expectStage(record, "address");
      const address = parse(addressSchema, body);
      record.session = { ...record.session, address, stage: "account-type" };
      break;
    }
    case "account-type": {
      expectStage(record, "account-type");
      const { accountType } = parse(accountTypeSchema, body);
      record.session = { ...record.session, accountType, stage: "documents" };
      break;
    }
    case "documents": {
      expectStage(record, "documents", "verification");
      if (
        record.session.stage === "verification" &&
        record.session.verification?.status !== "rejected"
      )
        throw new HttpError(409, "فقط احراز هویت ردشده را می‌توان دوباره انجام داد");
      if (!(body instanceof FormData))
        throw new HttpError(422, "مدارک شناسایی را به صورت فایل ارسال کنید");
      const [front, back] = await Promise.all([
        document(body.get("front"), "front"),
        document(body.get("back"), "back"),
      ]);
      record.verificationReadyAt = undefined;
      record.session = {
        ...record.session,
        stage: "liveness",
        documents: { front, back },
        liveness: undefined,
        verification: undefined,
      };
      message =
        "فایل‌ها دریافت شدند. فقط نام فایل‌ها به‌صورت محلی نگهداری می‌شود و محتوای آن‌ها حذف می‌شود.";
      break;
    }
    case "liveness": {
      expectStage(record, "liveness");
      if (!(body instanceof FormData)) throw new HttpError(422, "ویدیوی چهره لازم است");
      const clip = body.get("video");
      if (!(clip instanceof File) || clip.size < 100 || clip.size > MAX_VIDEO_BYTES)
        throw new HttpError(422, "حجم ویدیوی چهره باید بین ۱۰۰ بایت و ۱۰ مگابایت باشد");
      const bytes = new Uint8Array(await clip.slice(0, 12).arrayBuffer());
      const webm = [0x1a, 0x45, 0xdf, 0xa3].every((value, index) => bytes[index] === value);
      const mp4 = String.fromCharCode(...bytes.slice(4, 8)) === "ftyp";
      if (!((clip.type.startsWith("video/webm") && webm) || (clip.type === "video/mp4" && mp4)))
        throw new HttpError(422, "یک ویدیوی معتبر WebM یا MP4 ارسال کنید");
      record.verificationReadyAt = Date.now() + 1500;
      record.session = {
        ...record.session,
        stage: "verification",
        liveness: "demo-received",
        verification: { status: "pending" },
      };
      message = "ویدیوی چهره دریافت و حذف شد. در انتظار نتیجه بررسی محلی هستیم.";
      break;
    }
    case "edit": {
      expectStage(
        record,
        "address",
        "account-type",
        "documents",
        "liveness",
        "verification",
        "review",
      );
      if (record.session.verification?.status === "manual_review")
        throw new HttpError(409, "این درخواست در انتظار بررسی کارشناسی است");
      record.verificationReadyAt = undefined;
      record.session = {
        stage: "personal-info",
        mode: "demo",
        mobile: record.session.mobile,
        personalInfo: record.session.personalInfo,
        address: record.session.address,
        accountType: record.session.accountType,
      };
      message = "اطلاعات را ویرایش کنید و مراحل احراز هویت را دوباره انجام دهید.";
      break;
    }
    case "submit": {
      // Final endpoint uses the saved account type and an authoritative approved result.
      expectStage(record, "review", "complete");
      parse(submitSchema, body);
      if (record.session.bankRequest)
        return { session: record.session, message: "این درخواست قبلاً ارسال شده است." };
      parse(personalInfoSchema, record.session.personalInfo);
      parse(addressSchema, record.session.address);
      const { accountType } = parse(accountTypeSchema, { accountType: record.session.accountType });
      if (
        record.session.verification?.status !== "approved" ||
        !record.session.documents ||
        !record.session.liveness
      )
        throw new HttpError(409, "پیش از ارسال، تأیید احراز هویت لازم است");
      record.session = {
        ...record.session,
        stage: "complete",
        bankRequest: {
          reference: `LOCAL-${randomUUID().slice(0, 8).toUpperCase()}`,
          status: "demo-requested",
          accountType,
        },
      };
      message = "درخواست به‌صورت محلی دریافت شد. حساب بانکی افتتاح نشده است.";
      break;
    }
    case "restart": {
      record.session = { stage: "mobile", mode: "demo" };
      record.attempts = 0;
      record.otp = undefined;
      record.verificationReadyAt = undefined;
      message = "نشست شما پاک شد.";
      break;
    }
  }
  return { session: record.session, message };
}
