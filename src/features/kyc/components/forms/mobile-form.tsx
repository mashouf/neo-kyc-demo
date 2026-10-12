"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Field } from "@/components/ui/field";
import { mobileSchema, digitRules } from "../../contracts";
import type { z } from "zod";
import { SubmitButton } from "@/components/ui/submit-button";
import type { StepProps } from "../../form-types";
import { StepForm } from "./form-shell";

export function MobileForm({ busy, submit }: StepProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof mobileSchema>>({
    resolver: zodResolver(mobileSchema),
    defaultValues: { mobile: "" },
  });
  return (
    <StepForm
      noValidate
      onSubmit={handleSubmit((body) => submit({ action: "send-otp", body }))}
      className="space-y-6"
    >
      <Field
        label="شماره همراه"
        placeholder={"0".repeat(digitRules.mobile)}
        type="tel"
        inputMode="numeric"
        autoComplete="tel-national"
        maxLength={digitRules.mobile}
        hint={`${digitRules.mobile.toLocaleString("fa-IR")} رقم، بدون کد کشور وارد کنید. فقط تعداد ارقام بررسی می‌شود.`}
        error={errors.mobile?.message}
        {...register("mobile")}
      />
      <div className="rounded-xl bg-brand-tint p-4 text-sm leading-6 text-on-brand-tint">
        برای دریافت کد تأیید، شماره همراه خود را وارد کنید.{" "}
      </div>
      <SubmitButton busy={busy}> دریافت کد تأیید </SubmitButton>
    </StepForm>
  );
}
