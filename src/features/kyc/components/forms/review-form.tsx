"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CheckboxField } from "@/components/ui/checkbox-field";
import { submitSchema } from "../../contracts";
import type { z } from "zod";
import { SubmitButton } from "@/components/ui/submit-button";
import type { StepProps } from "../../form-types";
import { StepForm } from "./form-shell";

export function ReviewForm({ session, busy, submit }: StepProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof submitSchema>>({
    resolver: zodResolver(submitSchema),
    defaultValues: { confirmed: false },
  });
  const personal = session.personalInfo;
  const address = session.address;
  const rows = [
    ["شماره همراه", session.mobile],
    ["نام و نام خانوادگی", `${personal?.firstName ?? ""} ${personal?.familyName ?? ""}`],
    ["شماره شناسایی", personal?.nationalId],
    ["استان / شهر", `${address?.region ?? ""}, ${address?.city ?? ""}`],
    ["نشانی", address?.address],
    ["کد پستی", address?.postalCode],
    ["نوع حساب", session.accountType === "savings" ? "پس‌انداز" : "شخصی"],
    ["روی مدرک", session.documents?.front],
    ["پشت مدرک", session.documents?.back],
    ["وضعیت احراز هویت", "تأیید شده"],
  ];
  return (
    <StepForm
      onSubmit={handleSubmit((body) => submit({ action: "submit", body }))}
      className="space-y-6"
    >
      <dl className="divide-y divide-outline rounded-xl border border-outline px-4">
        {rows.map(([label, value]) => (
          <div key={label} className="grid gap-1 py-3 @md:grid-cols-[8rem_minmax(0,1fr)]">
            <dt className="text-xs text-content-muted">{label}</dt>
            <dd dir="auto" className="break-words text-sm font-medium">
              {value}
            </dd>
          </div>
        ))}
      </dl>
      <Button
        type="button"
        variant="outline"
        disabled={busy}
        onClick={() => submit({ action: "edit", body: {} })}
        className="h-11 rounded-xl"
      >
        <RotateCcw className="size-4" />
        ویرایش اطلاعات{" "}
      </Button>
      <p className="text-xs leading-5 text-content-muted">
        با ویرایش اطلاعات، بررسی‌های بعدی پاک می‌شوند و باید دوباره انجام شوند.{" "}
      </p>
      <CheckboxField
        disabled={busy}
        label="اطلاعات بالا را بررسی کرده‌ام و صحت آن‌ها را تأیید می‌کنم."
        error={errors.confirmed?.message}
        {...register("confirmed")}
      />
      <SubmitButton busy={busy}> ارسال درخواست </SubmitButton>
    </StepForm>
  );
}
