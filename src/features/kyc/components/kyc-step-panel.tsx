"use client";
import { useEffect, useRef } from "react";
import { BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { stepLabels, type Step } from "../contracts";
import { descriptions, forms } from "../step-config";
import { VerificationStep } from "./verification";
import { KycReceipt } from "./kyc-receipt";
import type { KycFlowState } from "../use-kyc-flow";

export function KycStepPanel({
  session,
  error,
  message,
  busy,
  loading,
  unavailable,
  submit,
  onStatus,
  retry,
}: KycFlowState) {
  const stage = session.stage;
  const titleRef = useRef<HTMLHeadingElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!loading && !unavailable) titleRef.current?.focus();
  }, [stage, loading, unavailable]);
  useEffect(() => {
    if (error) errorRef.current?.focus();
  }, [error]);
  const Form = stage === "complete" || stage === "verification" ? null : forms[stage];
  const content = stage === "complete" ? null : descriptions[stage];
  return (
    <section
      aria-busy={busy || loading}
      className="kyc-panel @container w-full min-w-0 rounded-2xl border border-outline/80 bg-surface p-5 shadow-panel sm:rounded-3xl sm:p-8 lg:p-10"
    >
      {loading ? (
        <div role="status" className="space-y-5 py-12">
          <div className="h-7 w-2/3 animate-pulse rounded bg-surface-raised" />
          <div className="h-12 animate-pulse rounded-xl bg-surface-raised" />
          <p className="text-sm text-content-muted"> در حال بارگذاری درخواست شما… </p>
        </div>
      ) : unavailable ? (
        <div className="space-y-4 py-6">
          <h2 ref={titleRef} tabIndex={-1} className="text-xl font-semibold outline-none">
            بارگذاری درخواست ممکن نیست{" "}
          </h2>
          <p role="alert" className="text-sm leading-6 text-content-secondary">
            {error}
          </p>
          <Button onClick={retry} className="h-12 rounded-xl">
            تلاش دوباره{" "}
          </Button>
        </div>
      ) : (
        <>
          <div className="mb-7">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-brand-tint px-3 py-1.5 text-[10px] font-semibold tracking-widest text-on-brand-tint">
              <BadgeCheck className="size-3.5" />
              {content?.tag ?? "درخواست دریافت شد"}
            </span>
            <h2
              ref={titleRef}
              tabIndex={-1}
              className="text-2xl font-semibold leading-tight tracking-tight outline-none sm:text-3xl"
            >
              {content?.title ?? "درخواست شما دریافت شد."}
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-content-muted">
              {content?.description ?? "درخواست افتتاح حساب دریافت شد. کد پیگیری زیر را نگه دارید."}
            </p>
          </div>
          {error && (
            <div
              ref={errorRef}
              tabIndex={-1}
              role="alert"
              className="mb-5 rounded-xl border border-danger-outline bg-danger-surface p-4 text-sm leading-6 text-danger-content outline-none"
            >
              {error}
              <p className="mt-1 text-xs">
                مرحله فعلی شما حفظ شده است. مشکل را برطرف کنید و دوباره تلاش کنید. اگر نشست منقضی
                شده، صفحه را تازه‌سازی کنید.{" "}
              </p>
            </div>
          )}
          {message && (
            <p
              role="status"
              className="mb-5 rounded-xl bg-surface-muted p-4 text-sm leading-6 text-content-secondary"
            >
              {message}
            </p>
          )}
          {stage === "verification" ? (
            <VerificationStep session={session} busy={busy} onStatus={onStatus} submit={submit} />
          ) : Form ? (
            <fieldset disabled={busy} className="min-w-0">
              <legend className="sr-only">{stepLabels[stage as Step]}</legend>
              <Form key={stage} session={session} busy={busy} submit={submit} />
            </fieldset>
          ) : (
            <KycReceipt session={session} busy={busy} submit={submit} />
          )}
        </>
      )}
    </section>
  );
}
