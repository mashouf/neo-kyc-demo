"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { accountTypeSchema } from "../../contracts";
import type { z } from "zod";
import { SubmitButton } from "@/components/ui/submit-button";
import type { StepProps } from "../../form-types";
import { StepForm } from "./form-shell";

export function AccountTypeForm({ session, busy, submit }: StepProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof accountTypeSchema>>({
    resolver: zodResolver(accountTypeSchema),
    defaultValues: { accountType: session.accountType ?? "personal" },
  });
  return (
    <StepForm
      onSubmit={handleSubmit((body) => submit({ action: "account-type", body }))}
      className="space-y-6"
    >
      <fieldset disabled={busy}>
        <legend className="mb-3 text-sm font-medium"> نوع حساب را انتخاب کنید </legend>
        <div className="grid gap-3 @md:grid-cols-2">
          {(
            [
              { value: "personal", name: "شخصی", hint: "برای امور روزمره" },
              { value: "savings", name: "پس‌انداز", hint: "برای پس‌انداز" },
            ] as const
          ).map((option) => (
            <label
              key={option.value}
              className="flex cursor-pointer items-start gap-3 rounded-xl border border-outline p-4 has-checked:border-brand has-checked:bg-brand-tint"
            >
              <input
                type="radio"
                value={option.value}
                {...register("accountType")}
                className="mt-1 size-4 accent-brand"
              />
              <span>
                <span className="block text-sm font-semibold">{option.name}</span>
                <span className="text-xs text-content-muted">{option.hint}</span>
              </span>
            </label>
          ))}
        </div>
        {errors.accountType && (
          <p role="alert" className="mt-2 text-sm text-danger">
            {errors.accountType.message}
          </p>
        )}
      </fieldset>
      <p className="text-sm leading-6 text-content-muted">
        انتخاب شما در درخواست ذخیره می‌شود. ارسال نهایی پس از احراز هویت و بررسی شما انجام خواهد
        شد.{" "}
      </p>
      <SubmitButton busy={busy}> ثبت نوع حساب </SubmitButton>
    </StepForm>
  );
}
