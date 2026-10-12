"use client";
import { useLivenessCamera } from "../use-liveness-camera";
import { Camera, Circle, Square, Video, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { StepProps } from "../forms";
import { SubmitButton } from "@/components/ui/submit-button";
import { MAX_VIDEO_BYTES } from "../contracts";

export function LivenessForm({ busy, submit }: StepProps) {
  const {
    videoRef,
    recorderRef,
    camera,
    opening,
    recording,
    file,
    error,
    setError,
    close,
    open,
    record,
  } = useLivenessCamera();
  return (
    <form
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault();
        if (!file || file.size < 100 || file.size > MAX_VIDEO_BYTES) {
          setError("با دوربین خود ویدیوی تازه‌ای از چهره ضبط کنید؛ حداکثر ۱۰ مگابایت.");
          return;
        }
        close();
        const body = new FormData();
        body.set("video", file);
        submit({ action: "liveness", body });
      }}
    >
      <div className="relative mx-auto flex aspect-4/3 max-h-80 w-full items-center justify-center overflow-hidden rounded-2xl bg-camera">
        <video
          ref={videoRef}
          muted
          playsInline
          aria-label="تصویر زنده دوربین"
          className={`absolute inset-0 h-full w-full -scale-x-100 object-cover ${camera ? "" : "invisible"}`}
        />
        {!camera && (
          <div className="z-10 flex flex-col items-center gap-3 p-5 text-center text-content-soft">
            <Video className="size-9 text-brand-soft" />
            <span className="text-sm">
              {file ? "ویدیوی چهره آماده ارسال است" : "تصویر دوربین اینجا نمایش داده می‌شود"}
            </span>
          </div>
        )}
        {camera && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-5 left-1/2 w-2/5 -translate-x-1/2 rounded-[50%] border-2 border-dashed border-inverse/70"
          />
        )}
        {recording && (
          <span
            role="status"
            className="absolute bottom-3 rounded-full bg-recording px-3 py-1 text-xs text-inverse"
          >
            در حال ضبط · پس از ۶ ثانیه خودکار متوقف می‌شود{" "}
          </span>
        )}
      </div>
      <p className="text-sm leading-6 text-content-muted">
        در نور مناسب روبه‌روی دوربین بایستید. ابتدا مستقیم نگاه کنید و سپس آرام سر خود را به چپ و
        راست بچرخانید. ویدیوی تازه‌ای با دوربین ضبط کنید.{" "}
      </p>
      <div className="flex flex-wrap gap-2">
        {!camera ? (
          <Button
            type="button"
            variant="outline"
            disabled={busy || opening}
            onClick={open}
            className="h-11 rounded-xl"
          >
            <Camera className="size-4" />
            {opening ? "در حال باز کردن دوربین…" : file ? "ضبط دوباره" : "باز کردن دوربین"}
          </Button>
        ) : (
          <>
            <Button
              type="button"
              disabled={busy}
              onClick={recording ? () => recorderRef.current?.stop() : record}
              className="h-11 rounded-xl bg-brand-soft"
            >
              {recording ? <Square className="size-4" /> : <Circle className="size-4" />}
              {recording ? "توقف ضبط" : "ضبط ویدیوی ۶ ثانیه‌ای"}
            </Button>
            <Button type="button" variant="outline" onClick={close} className="h-11 rounded-xl">
              <X className="size-4" />
              بستن دوربین{" "}
            </Button>
          </>
        )}
      </div>
      {file && (
        <p
          role="status"
          className="break-all rounded-lg bg-brand-tint p-3 text-sm text-on-brand-tint"
        >
          {file.name} · {(file.size / 1024).toFixed(0)} KB
        </p>
      )}
      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
      <SubmitButton busy={busy || recording || opening || !file}> ارسال ویدیو </SubmitButton>
    </form>
  );
}
