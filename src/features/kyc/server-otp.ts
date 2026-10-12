import "server-only";
import { mobileSchema, otpSchema, type ApiResult } from "./contracts";
import { HttpError, expectStage, parse, type RecordState } from "./server";

export function handleOtpAction(
  record: RecordState,
  action: "send-otp" | "verify-otp",
  body: unknown,
): ApiResult {
  let message: string | undefined;
  switch (action) {
    case "send-otp": {
      expectStage(record, "mobile", "otp");
      const data = parse(mobileSchema, body);
      if (record.resendAt && Date.now() < record.resendAt)
        throw new HttpError(429, "برای درخواست کد جدید کمی صبر کنید");
      if (record.sends >= 5)
        throw new HttpError(
          429,
          "تعداد درخواست کد به حد مجاز رسیده است. پس از پایان نشست دوباره تلاش کنید.",
        );
      record.sends++;
      record.otp = "123456";
      record.attempts = 0;
      record.otpExpiresAt = Date.now() + 5 * 60 * 1000;
      record.resendAt = Date.now() + 30_000;
      record.session = {
        ...record.session,
        mobile: data.mobile,
        stage: "otp",
        otpExpiresAt: record.otpExpiresAt,
        resendAt: record.resendAt,
      };
      message = "کد تأیید محلی: 123456. پیامکی ارسال نشده است.";
      break;
    }
    case "verify-otp": {
      expectStage(record, "otp");
      const { code } = parse(otpSchema, body);
      if (!record.otpExpiresAt || Date.now() > record.otpExpiresAt)
        throw new HttpError(422, "کد منقضی شده است. کد جدید درخواست کنید.");
      if (record.attempts >= 5)
        throw new HttpError(429, "تعداد تلاش‌ها بیش از حد مجاز است. کد جدید درخواست کنید.");
      record.attempts++;
      if (code !== record.otp) throw new HttpError(422, "کد واردشده درست نیست. دوباره تلاش کنید.");
      record.otp = undefined;
      record.session = {
        ...record.session,
        stage: "personal-info",
        otpExpiresAt: undefined,
        resendAt: undefined,
      };
      break;
    }
  }
  return { session: record.session, message };
}
