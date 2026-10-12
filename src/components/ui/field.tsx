"use client";
import { useId } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function Field({
  label,
  hint,
  error,
  className,
  id,
  ...props
}: React.ComponentProps<typeof Input> & { label: string; hint?: string; error?: string }) {
  const generated = useId();
  const fieldId = id ?? generated;
  return (
    <div className={cn("min-w-0 space-y-2", className)}>
      <label htmlFor={fieldId} className="block text-sm font-medium text-content-strong">
        {label}
      </label>
      <Input
        {...props}
        id={fieldId}
        dir={
          props.dir ?? (props.inputMode === "numeric" || props.type === "tel" ? "ltr" : undefined)
        }
        aria-invalid={!!error}
        aria-describedby={error || hint ? `${fieldId}-help` : undefined}
        className="h-12 rounded-xl border-outline bg-surface text-base shadow-none"
      />
      {(error || hint) && (
        <p
          id={`${fieldId}-help`}
          className={cn("text-xs leading-relaxed", error ? "text-danger" : "text-content-muted")}
        >
          {error ?? hint}
        </p>
      )}
    </div>
  );
}
