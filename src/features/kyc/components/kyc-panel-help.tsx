import { CircleHelp } from "lucide-react";

export function KycPanelHelp() {
  return (
    <div className="mt-5 flex flex-wrap items-start justify-between gap-3 text-xs leading-5 text-content-subtle">
      <p className="flex items-center gap-1.5">
        <CircleHelp className="size-3.5" />
        پیشرفت شما در این نشست تا ۳۰ دقیقه در دسترس است.{" "}
      </p>
    </div>
  );
}
