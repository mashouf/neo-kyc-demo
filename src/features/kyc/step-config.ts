import type { ComponentType } from "react";
import type { Step } from "./contracts";
import {
  AccountTypeForm,
  AddressForm,
  PersonalInfoForm,
  DocumentsForm,
  MobileForm,
  OtpForm,
  ReviewForm,
  type StepProps,
} from "./forms";
import { LivenessForm } from "./components/liveness";

export const descriptions: Record<Step, { title: string; description: string; tag: string }> = {
  mobile: {
    title: "با شماره همراه شروع کنیم",
    description: "اولین قدم برای حساب جدید؛ شماره همراه خود را وارد کنید.",
    tag: "شروع درخواست",
  },
  otp: {
    title: "شماره همراه را تأیید کنید",
    description: "برای ادامه درخواست، کد تأیید شش‌رقمی را وارد کنید.",
    tag: "تأیید شماره همراه",
  },
  "personal-info": {
    title: "کمی درباره شما",
    description: "نام، نام خانوادگی و شماره شناسایی را مطابق مدارک خود وارد کنید.",
    tag: "اطلاعات فردی",
  },
  address: {
    title: "کجا زندگی می‌کنید؟",
    description: "نشانی محل سکونت و کد پستی را وارد کنید.",
    tag: "نشانی محل سکونت",
  },
  "account-type": {
    title: "حساب خود را انتخاب کنید",
    description: "نوع حساب دلخواه را انتخاب کنید و سپس احراز هویت را ادامه دهید.",
    tag: "نوع حساب",
  },
  documents: {
    title: "مدارک شناسایی را اضافه کنید",
    description: "تصویر واضحی از رو و پشت مدرک شناسایی ارسال کنید.",
    tag: "ارسال مدارک",
  },
  liveness: {
    title: "چهره‌تان را ثبت کنید",
    description: "برای بررسی زنده بودن و تطبیق چهره، یک ویدیوی کوتاه ضبط کنید.",
    tag: "ضبط چهره",
  },
  verification: {
    title: "در حال بررسی درخواست شما",
    description: "مدارک شما ارسال شده است. نتیجه احراز هویت پیش از بررسی نهایی دریافت می‌شود.",
    tag: "وضعیت احراز هویت",
  },
  review: {
    title: "همه‌چیز را بررسی کنید",
    description: "اطلاعات و نوع حساب را بررسی کنید و سپس درخواست را ارسال کنید.",
    tag: "بررسی و ارسال",
  },
};
export const forms: Record<Exclude<Step, "verification">, ComponentType<StepProps>> = {
  mobile: MobileForm,
  otp: OtpForm,
  "personal-info": PersonalInfoForm,
  address: AddressForm,
  "account-type": AccountTypeForm,
  documents: DocumentsForm,
  liveness: LivenessForm,
  review: ReviewForm,
};
