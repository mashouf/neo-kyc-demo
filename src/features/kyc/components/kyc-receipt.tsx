import { ArrowUpRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { StepProps } from "../forms";

export function KycReceipt({ session, busy, submit }: StepProps) {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-outline-brand bg-brand-tint p-6">
        <CheckCircle2 className="mb-4 size-10 text-brand-soft" />
        <p className="text-sm text-on-brand-tint"> کد پیگیری درخواست </p>
        <p dir="ltr" className="mt-2 break-all font-mono text-2xl font-semibold text-brand-content">
          {session.bankRequest?.reference}
        </p>
        <p className="mt-3 text-sm capitalize text-on-brand-tint">
          {session.bankRequest?.accountType === "savings" ? "پس‌انداز" : "شخصی"} حساب · درخواست ثبت
          شد{" "}
        </p>
      </div>
      <p className="text-sm leading-6 text-content-muted">
        احراز هویت و افتتاح حساب واقعی انجام نشده است. برای استفاده عملیاتی، اتصال به سرویس‌های
        تأیید پیامکی، احراز هویت و بانکداری لازم است.{" "}
      </p>
      <Button
        variant="outline"
        disabled={busy}
        onClick={() => submit({ action: "restart", body: {} })}
        className="h-12 w-full rounded-xl sm:w-auto"
      >
        شروع درخواست جدید <ArrowUpRight className="size-4" />
      </Button>
    </div>
  );
}
