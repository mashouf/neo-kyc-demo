"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Field } from "@/components/ui/field";
import { personalInfoSchema, digitRules, type PersonalInfo } from "../../contracts";
import { SubmitButton } from "@/components/ui/submit-button";
import type { StepProps } from "../../form-types";
import { StepForm } from "./form-shell";

export function PersonalInfoForm({ session, busy, submit }: StepProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PersonalInfo>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: session.personalInfo ?? { firstName: "", familyName: "", nationalId: "" },
  });
  return (
    <StepForm
      noValidate
      onSubmit={handleSubmit((body) => submit({ action: "personal-info", body }))}
      className="space-y-6"
    >
      <div className="grid gap-4 @md:grid-cols-2">
        <Field
          label="نام"
          autoComplete="given-name"
          error={errors.firstName?.message}
          {...register("firstName")}
        />
        <Field
          label="نام خانوادگی"
          autoComplete="family-name"
          error={errors.familyName?.message}
          {...register("familyName")}
        />
      </div>
      <Field
        label="شماره شناسایی"
        inputMode="numeric"
        maxLength={digitRules.nationalId}
        autoComplete="off"
        hint={`${digitRules.nationalId.toLocaleString("fa-IR")} رقم، با احتساب صفرهای ابتدایی وارد کنید.`}
        error={errors.nationalId?.message}
        {...register("nationalId")}
      />
      <SubmitButton busy={busy}> ثبت اطلاعات فردی </SubmitButton>
    </StepForm>
  );
}
