"use client";
import { useState } from "react";
import { FileUp } from "lucide-react";
import { FilePreview } from "@/components/ui/file-preview";
import { MAX_DOCUMENT_BYTES } from "../../contracts";
import { SubmitButton } from "@/components/ui/submit-button";
import type { StepProps } from "../../form-types";
import { StepForm } from "./form-shell";

export function DocumentsForm({ busy, submit }: StepProps) {
  const [front, setFront] = useState<File | null>(null);
  const [back, setBack] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const select = (file: File | undefined, setter: (file: File | null) => void) => {
    setError(null);
    if (!file) {
      setter(null);
      return;
    }
    if (
      !new Set(["image/jpeg", "image/png", "application/pdf"]).has(file.type) ||
      !file.size ||
      file.size > MAX_DOCUMENT_BYTES
    ) {
      setter(null);
      setError("یک فایل JPEG، PNG یا PDF با حجم حداکثر ۵ مگابایت انتخاب کنید.");
      return;
    }
    setter(file);
  };
  return (
    <StepForm
      className="space-y-6"
      onSubmit={(event) => {
        event.preventDefault();
        if (!front || !back) {
          setError("تصویر هر دو طرف مدرک شناسایی را انتخاب کنید.");
          return;
        }
        const body = new FormData();
        body.set("front", front);
        body.set("back", back);
        submit({ action: "documents", body });
      }}
    >
      <div className="grid gap-4 @md:grid-cols-2">
        {(
          [
            { key: "front", title: "روی مدرک شناسایی", file: front, setter: setFront },
            { key: "back", title: "پشت مدرک شناسایی", file: back, setter: setBack },
          ] as const
        ).map(({ key, title, file, setter }) => (
          <label
            key={key}
            htmlFor={`id-${key}`}
            className="flex min-w-0 cursor-pointer flex-col gap-3 rounded-2xl border border-dashed border-outline-strong bg-surface-muted p-5 focus-within:ring-2 focus-within:ring-brand"
          >
            <FileUp className="size-7 text-brand-soft" />
            <span className="text-sm font-semibold">{title}</span>
            {file && <FilePreview file={file} label={title} />}
            <span className="break-all text-xs text-content-muted">
              {file
                ? `${file.name} · ${(file.size / 1024).toFixed(0)} KB`
                : "JPEG، PNG یا PDF · حداکثر ۵ مگابایت"}
            </span>
            <span className="text-sm text-brand-soft">{file ? "تغییر فایل" : "انتخاب فایل"}</span>
            <input
              id={`id-${key}`}
              type="file"
              accept="image/jpeg,image/png,application/pdf"
              disabled={busy}
              aria-describedby="document-help"
              className="sr-only"
              onChange={(event) => select(event.target.files?.[0], setter)}
            />
          </label>
        ))}
      </div>
      <p id="document-help" className="text-sm leading-6 text-content-muted">
        هر چهار گوشه مدرک مشخص باشد و نور روی آن بازتاب نداشته باشد. هر دو تصویر را پیش از ارسال
        بررسی کنید.{" "}
      </p>
      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
      <SubmitButton busy={busy}> ارسال مدارک شناسایی </SubmitButton>
    </StepForm>
  );
}
