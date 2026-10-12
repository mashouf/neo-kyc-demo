"use client";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Clock3, LoaderCircle, ShieldCheck, ShieldX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { kycApi } from "../api";
import { DocumentsForm, type StepProps } from "../forms";
import type { StatusResult } from "../contracts";

export function VerificationStep({
  onStatus,
  ...props
}: StepProps & { onStatus: (result: StatusResult) => void }) {
  const status = useQuery({
    queryKey: ["ekyc-status"],
    queryFn: ({ signal }) => kycApi.status(signal),
    staleTime: 0,
    gcTime: 0,
    retry: 1,
    refetchOnWindowFocus: false,
    refetchInterval: (query) =>
      !query.state.error &&
      (!query.state.data || query.state.data.verification.status === "pending")
        ? 2000
        : false,
  });
  useEffect(() => {
    if (status.data) onStatus(status.data);
  }, [status.data, onStatus]);
  const result = status.data?.verification;
  if (status.isError)
    return (
      <div
        role="alert"
        className="space-y-4 rounded-xl border border-danger-outline bg-danger-surface p-5 text-sm leading-6 text-danger-content"
      >
        <p>{status.error.message}</p>
        <p> درخواست شما ارسال نشده است. اگر نشست منقضی شده، صفحه را تازه‌سازی کنید. </p>
        <Button
          variant="outline"
          onClick={() => void status.refetch()}
          disabled={status.isFetching}
          className="h-12 rounded-xl"
        >
          {status.isFetching ? "در حال بررسی…" : "بررسی دوباره وضعیت"}
        </Button>
      </div>
    );
  if (result?.status === "rejected")
    return (
      <div className="space-y-6">
        <div
          role="alert"
          className="rounded-xl border border-danger-outline bg-danger-surface p-5 text-sm leading-6 text-danger-content"
        >
          <ShieldX className="mb-3 size-7" />
          <p className="font-semibold"> احراز هویت نیاز به تلاش دوباره دارد </p>
          <p>{result.reason ?? "مدارک را دوباره ارسال کنید و مرحله ضبط چهره را تکرار کنید."}</p>
        </div>
        <DocumentsForm {...props} />
      </div>
    );
  if (result?.status === "manual_review")
    return (
      <div
        role="status"
        className="space-y-4 rounded-xl border border-warning-outline bg-warning-surface p-6 text-sm leading-6 text-warning-content"
      >
        <Clock3 className="size-8" />
        <p className="font-semibold"> درخواست شما در انتظار بررسی کارشناسی است </p>
        <p>{result.reason ?? "پیش از ارسال نهایی، کارشناسان باید درخواست شما را بررسی کنند."}</p>
        <Button
          variant="outline"
          onClick={() => void status.refetch()}
          disabled={status.isFetching}
          className="h-12 rounded-xl"
        >
          بررسی آخرین وضعیت{" "}
        </Button>
      </div>
    );
  return (
    <div
      role="status"
      className="space-y-4 rounded-2xl border border-outline-brand bg-brand-tint p-6 text-sm leading-6 text-brand-content"
    >
      <ShieldCheck className="size-9 text-brand-soft" />
      <p className="flex items-center gap-2 font-semibold">
        <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
        {result?.status === "approved"
          ? "احراز هویت انجام شد. در حال باز کردن بررسی نهایی…"
          : "در انتظار نتیجه احراز هویت…"}
      </p>
      <p>
        وضعیت احراز هویت هر ۲ ثانیه بررسی می‌شود. پس از تأیید، می‌توانید درخواست خود را مرور و ارسال
        کنید.{" "}
      </p>
    </div>
  );
}
