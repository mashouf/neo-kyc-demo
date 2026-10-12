"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Field } from "@/components/ui/field";
import { addressSchema, digitRules, type Address } from "../../contracts";
import { SubmitButton } from "@/components/ui/submit-button";
import type { StepProps } from "../../form-types";
import { StepForm } from "./form-shell";

export function AddressForm({ session, busy, submit }: StepProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Address>({
    resolver: zodResolver(addressSchema),
    defaultValues: session.address ?? { region: "", city: "", address: "", postalCode: "" },
  });
  return (
    <StepForm
      noValidate
      onSubmit={handleSubmit((body) => submit({ action: "address", body }))}
      className="space-y-6"
    >
      <div className="grid gap-4 @md:grid-cols-2">
        <Field
          label="استان / منطقه"
          autoComplete="address-level1"
          error={errors.region?.message}
          {...register("region")}
        />
        <Field
          label="شهر"
          autoComplete="address-level2"
          error={errors.city?.message}
          {...register("city")}
        />
      </div>
      <Field
        label="نشانی کامل"
        autoComplete="street-address"
        placeholder="خیابان، ساختمان، طبقه، واحد"
        error={errors.address?.message}
        {...register("address")}
      />
      <Field
        label="کد پستی"
        inputMode="numeric"
        autoComplete="postal-code"
        maxLength={digitRules.postalCode}
        hint={`${digitRules.postalCode.toLocaleString("fa-IR")} رقم وارد کنید.`}
        error={errors.postalCode?.message}
        {...register("postalCode")}
      />
      <SubmitButton busy={busy}> ثبت نشانی </SubmitButton>
    </StepForm>
  );
}
