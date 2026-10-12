import { ChevronRight } from "lucide-react";

export function KycIntro() {
  return (
    <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
      <div>
        <p className="flex items-center gap-2 text-xs text-content-muted">
          بانکداری شخصی <ChevronRight className="size-3" />
          <span className="text-content-strong"> افتتاح حساب </span>
        </p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
          یک قدم نزدیک‌تر به حساب شما.{" "}
        </h1>
      </div>
    </div>
  );
}
