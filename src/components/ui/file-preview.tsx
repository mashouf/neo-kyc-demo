"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { FileText } from "lucide-react";

export function FilePreview({ file, label }: { file: File; label: string }) {
  const [preview, setPreview] = useState<{ file: File; url: string } | null>(null);
  const [failed, setFailed] = useState<File | null>(null);
  const isImage = file.type === "image/jpeg" || file.type === "image/png";

  useEffect(() => {
    if (file.type !== "image/jpeg" && file.type !== "image/png") return;
    const reader = new FileReader();
    let active = true;
    reader.onload = () => {
      if (active && typeof reader.result === "string") {
        setPreview({ file, url: reader.result });
      }
    };
    reader.onerror = () => {
      if (active) setFailed(file);
    };
    reader.readAsDataURL(file);
    return () => {
      active = false;
      if (reader.readyState === FileReader.LOADING) reader.abort();
    };
  }, [file]);

  if (!isImage) {
    return (
      <span className="flex items-center gap-3 rounded-xl border border-outline p-4">
        <FileText aria-hidden="true" className="size-8 shrink-0 text-brand-soft" />
        <span className="text-xs text-content-muted">
          فایل انتخاب شد؛ پیش‌نمایش تصویر در دسترس نیست.{" "}
        </span>
      </span>
    );
  }

  if (failed === file) {
    return (
      <span role="status" className="text-xs text-danger">
        نمایش تصویر ممکن نیست. اگر فایل آسیب دیده است، فایل دیگری انتخاب کنید.{" "}
      </span>
    );
  }

  if (preview?.file !== file) {
    return (
      <span role="status" className="text-xs text-content-muted">
        در حال بارگذاری تصویر…{" "}
      </span>
    );
  }

  return (
    <Image
      src={preview.url}
      alt={`پیش‌نمایش ${label}`}
      width={640}
      height={400}
      unoptimized
      onError={() => setFailed(file)}
      className="h-44 w-full rounded-xl border border-outline bg-camera object-contain sm:h-52"
    />
  );
}
