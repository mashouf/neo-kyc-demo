"use client";
import { useId } from "react";

export function CheckboxField({
  label,
  error,
  ...props
}: React.ComponentProps<"input"> & { label: React.ReactNode; error?: string }) {
  const id = useId();
  return (
    <div>
      <label
        className="flex cursor-pointer items-start gap-3 rounded-xl border border-outline bg-surface-muted p-4 text-sm leading-6"
        htmlFor={id}
      >
        <input
          {...props}
          id={id}
          type="checkbox"
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className="mt-1 size-5 shrink-0 accent-brand"
        />
        <span>{label}</span>
      </label>
      {error && (
        <p id={`${id}-error`} className="mt-2 text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
