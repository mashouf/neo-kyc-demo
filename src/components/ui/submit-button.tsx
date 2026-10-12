import { ArrowRight } from "lucide-react";
import { Button } from "./button";

export function SubmitButton({
  busy,
  children = "ادامه",
}: {
  busy: boolean;
  children?: React.ReactNode;
}) {
  return (
    <Button
      type="submit"
      disabled={busy}
      className="mt-2 h-12 w-full rounded-xl bg-brand-soft text-on-brand hover:bg-brand sm:w-auto sm:min-w-44"
    >
      {busy ? "لطفاً صبر کنید…" : children}
      {!busy && <ArrowRight className="size-4" />}
    </Button>
  );
}
