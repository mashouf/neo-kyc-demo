"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { otpSchema, digitRules } from "../../contracts";
import { MobileForm } from "./mobile-form";
import type { z } from "zod";
import { SubmitButton } from "@/components/ui/submit-button";
import type { StepProps } from "../../form-types";
import { StepForm } from "./form-shell";

export function OtpForm({ session, busy, submit }: StepProps) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  const wait = Math.max(0, Math.ceil(((session.resendAt ?? 0) - now) / 1000));
  const expired = now >= (session.otpExpiresAt ?? 0);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof otpSchema>>({
    resolver: zodResolver(otpSchema),
    defaultValues: { code: "" },
  });
  if (!session.mobile) return <MobileForm session={session} busy={busy} submit={submit} />;
  return (
    <StepForm
      noValidate
      onSubmit={handleSubmit((body) => submit({ action: "verify-otp", body }))}
      className="space-y-6"
    >
      <div className="rounded-xl bg-surface-muted p-4 text-sm text-content-secondary">
        تأیید شماره{" "}
        <strong dir="ltr" className="font-mono text-content">
          {session.mobile}
        </strong>
        .
      </div>
      <Field
        label="کد تأیید"
        placeholder="000000"
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={digitRules.otp}
        error={errors.code?.message}
        hint={
          expired ? "کد منقضی شده است. کد جدید درخواست کنید." : "کد شما تا ۵ دقیقه اعتبار دارد."
        }
        {...register("code")}
      />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SubmitButton busy={busy}> تأیید شماره همراه </SubmitButton>
        <Button
          type="button"
          variant="ghost"
          disabled={busy || wait > 0}
          onClick={() => submit({ action: "send-otp", body: { mobile: session.mobile } })}
          className="h-12"
        >
          {wait ? `ارسال دوباره تا ${wait.toLocaleString("fa-IR")} ثانیه دیگر` : "ارسال دوباره کد"}
        </Button>
      </div>
      <Button
        type="button"
        variant="link"
        disabled={busy}
        onClick={() => submit({ action: "restart", body: {} })}
        className="px-0 text-content-muted"
      >
        تغییر شماره همراه{" "}
      </Button>
    </StepForm>
  );
}
