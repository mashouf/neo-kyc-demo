import { z } from "zod";

// Country-independent defaults. Preserve leading zeros by storing digits as strings.
export const digitRules = { mobile: 11, nationalId: 10, postalCode: 10, otp: 6 } as const;
const digits = (length: number, label: string) =>
  z
    .string()
    .overwrite((value) =>
      value.replace(/[۰-۹٠-٩]/g, (digit) =>
        String(digit.charCodeAt(0) - (digit >= "۰" ? 1776 : 1632)),
      ),
    )
    .regex(
      new RegExp(`^\\d{${length}}$`),
      `${label} باید دقیقاً ${length.toLocaleString("fa-IR")} رقم باشد`,
    );
export const mobileSchema = z.object({ mobile: digits(digitRules.mobile, "شماره همراه") });
export const otpSchema = z.object({ code: digits(digitRules.otp, "کد") });
export const personalInfoSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, "حداقل ۲ نویسه وارد کنید")
    .max(80, "حداکثر ۸۰ نویسه وارد کنید"),
  familyName: z
    .string()
    .trim()
    .min(2, "حداقل ۲ نویسه وارد کنید")
    .max(80, "حداکثر ۸۰ نویسه وارد کنید"),
  nationalId: digits(digitRules.nationalId, "شماره شناسایی"),
});
export const addressSchema = z.object({
  region: z
    .string()
    .trim()
    .min(2, "استان یا منطقه را وارد کنید")
    .max(80, "حداکثر ۸۰ نویسه وارد کنید"),
  city: z.string().trim().min(2, "شهر خود را وارد کنید").max(80, "حداکثر ۸۰ نویسه وارد کنید"),
  address: z
    .string()
    .trim()
    .min(8, "نشانی کامل خود را وارد کنید")
    .max(300, "حداکثر ۳۰۰ نویسه وارد کنید"),
  postalCode: digits(digitRules.postalCode, "کد پستی"),
});
export const accountTypeSchema = z.object({ accountType: z.enum(["personal", "savings"]) });
export const submitSchema = z.object({
  confirmed: z.boolean().refine(Boolean, "صحت اطلاعات خود را تأیید کنید"),
});
export type PersonalInfo = z.infer<typeof personalInfoSchema>;
export type Address = z.infer<typeof addressSchema>;
export const steps = [
  "mobile",
  "otp",
  "personal-info",
  "address",
  "account-type",
  "documents",
  "liveness",
  "verification",
  "review",
] as const;
export type Step = (typeof steps)[number];
export type Stage = Step | "complete";
export const stepLabels: Record<Step, string> = {
  mobile: "شماره همراه",
  otp: "تأیید کد پیامکی",
  "personal-info": "اطلاعات فردی",
  address: "نشانی شما",
  "account-type": "نوع حساب",
  documents: "مدارک شناسایی",
  liveness: "بررسی زنده بودن چهره",
  verification: "وضعیت احراز هویت",
  review: "بررسی و ارسال",
};
export const apiRoutes = {
  session: "/api/onboarding/session",
  "personal-info": "/api/onboarding/personal-info",
  address: "/api/onboarding/address",
  "account-type": "/api/onboarding/account-type",
  documents: "/api/ekyc/document",
  liveness: "/api/ekyc/liveness",
  status: "/api/ekyc/status",
  submit: "/api/onboarding/submit",
  // Retained because replacement authentication/session-management routes were not supplied.
  "send-otp": "/api/kyc/send-otp",
  "verify-otp": "/api/kyc/verify-otp",
  edit: "/api/kyc/edit",
  restart: "/api/kyc/restart",
} as const;
export const actions = [
  "send-otp",
  "verify-otp",
  "personal-info",
  "address",
  "account-type",
  "documents",
  "liveness",
  "submit",
  "edit",
  "restart",
] as const;
export type ApiAction = (typeof actions)[number];
export type ApiCommand = { action: ApiAction; body: Record<string, unknown> | FormData };
export const verificationSchema = z.object({
  status: z.enum(["pending", "approved", "rejected", "manual_review"]),
  reason: z.string().optional(),
});
export const sessionSchema = z.object({
  stage: z.enum([...steps, "complete"]),
  mode: z.literal("demo"),
  mobile: z.string().optional(),
  personalInfo: personalInfoSchema.optional(),
  address: addressSchema.optional(),
  accountType: accountTypeSchema.shape.accountType.optional(),
  otpExpiresAt: z.number().optional(),
  resendAt: z.number().optional(),
  documents: z.object({ front: z.string(), back: z.string() }).optional(),
  liveness: z.literal("demo-received").optional(),
  verification: verificationSchema.optional(),
  bankRequest: z
    .object({
      reference: z.string(),
      status: z.literal("demo-requested"),
      accountType: accountTypeSchema.shape.accountType,
    })
    .optional(),
});
export type KycSession = z.infer<typeof sessionSchema>;
export const apiResultSchema = z.object({ session: sessionSchema, message: z.string().optional() });
export const statusResultSchema = apiResultSchema.extend({ verification: verificationSchema });
export type ApiResult = z.infer<typeof apiResultSchema>;
export type StatusResult = z.infer<typeof statusResultSchema>;
// Wire values from the session API are mapped explicitly to existing UI states.
export const sessionStepSchema = z.enum([
  "personal_info",
  "otp",
  "address",
  "account_type",
  "document",
  "liveness",
  "review",
]);
export type SessionStep = z.infer<typeof sessionStepSchema>;
export const sessionStepToStage = {
  personal_info: "personal-info",
  otp: "otp",
  address: "address",
  account_type: "account-type",
  document: "documents",
  liveness: "liveness",
  review: "review",
} as const satisfies Record<SessionStep, Stage>;
// Accept a bare step, flat { step, ...details }, or nested { session: { step, ...details } }.
const wireSessionSchema = sessionSchema.omit({ stage: true, mode: true }).extend({
  step: sessionStepSchema,
  mode: z.literal("demo").optional(),
});
export const sessionResponseSchema = z
  .union([
    sessionStepSchema.transform((step) => ({ step })),
    wireSessionSchema,
    z.object({ session: wireSessionSchema }).transform(({ session }) => session),
  ])
  .transform((data): ApiResult => {
    const details = wireSessionSchema.parse(data);
    // Preserve pending verification and the receipt when resuming a demo session.
    const stage =
      details.step === "review" && details.bankRequest
        ? "complete"
        : details.step === "liveness" && details.verification
          ? "verification"
          : sessionStepToStage[details.step];
    return { session: { ...details, mode: "demo", stage } };
  });
export const MAX_DOCUMENT_BYTES = 5 * 1024 * 1024;
export const MAX_VIDEO_BYTES = 10 * 1024 * 1024;
