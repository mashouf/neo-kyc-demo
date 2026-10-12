import { cn } from "@/lib/utils";
import { steps, type Stage } from "../contracts";

export function KycConnectionStatus({
  stage,
  loading,
  unavailable,
}: {
  stage: Stage;
  loading: boolean;
  unavailable: boolean;
}) {
  const index = stage === "complete" ? steps.length : steps.indexOf(stage);
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-xs text-content-muted">
      <span className="flex items-center gap-1.5">
        <span
          className={cn("size-1.5 rounded-full", unavailable ? "bg-warning-indicator" : "bg-brand")}
        />
        {unavailable ? "سرویس در دسترس نیست" : loading ? "در حال اتصال…" : "اتصال برقرار است"}
      </span>
      <span>
        {stage === "complete"
          ? "همه مراحل تکمیل شد"
          : `مرحله ${(index + 1).toLocaleString("fa-IR")} از ${steps.length.toLocaleString("fa-IR")}`}
      </span>
    </div>
  );
}
