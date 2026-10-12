"use client";
import { useEffect, useRef, useState } from "react";

export function useLivenessCamera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);
  const [camera, setCamera] = useState(false);
  const [opening, setOpening] = useState(false);
  const [recording, setRecording] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const stopStream = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  };
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (timerRef.current) clearTimeout(timerRef.current);
      if (recorderRef.current?.state === "recording") recorderRef.current.stop();
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);
  const close = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
    stopStream();
    setCamera(false);
    setRecording(false);
  };
  const open = async () => {
    setError(null);
    setOpening(true);
    try {
      if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined")
        throw new Error(
          "ضبط با دوربین در دسترس نیست. از مرورگر سازگار و اتصال HTTPS یا localhost استفاده کنید.",
        );
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 720 }, height: { ideal: 960 } },
        audio: false,
      });
      if (!mountedRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCamera(true);
      setFile(null);
    } catch (cause) {
      stopStream();
      setCamera(false);
      if (mountedRef.current)
        setError(
          cause instanceof Error && cause.name === "NotAllowedError"
            ? "دسترسی به دوربین رد شد. در تنظیمات مرورگر اجازه دسترسی بدهید و دوباره تلاش کنید."
            : cause instanceof Error
              ? cause.message
              : "باز کردن دوربین ممکن نیست.",
        );
    } finally {
      if (mountedRef.current) setOpening(false);
    }
  };
  const record = () => {
    if (!streamRef.current) return;
    setError(null);
    setFile(null);
    try {
      const mimeType = ["video/webm;codecs=vp8", "video/webm", "video/mp4"].find((type) =>
        MediaRecorder.isTypeSupported(type),
      );
      const recorder = new MediaRecorder(
        streamRef.current,
        mimeType ? { mimeType, videoBitsPerSecond: 1_000_000 } : undefined,
      );
      const chunks: Blob[] = [];
      recorderRef.current = recorder;
      recorder.ondataavailable = (event) => {
        if (event.data.size) chunks.push(event.data);
      };
      recorder.onstop = () => {
        stopStream();
        if (timerRef.current) clearTimeout(timerRef.current);
        if (!mountedRef.current) return;
        const type = recorder.mimeType.startsWith("video/mp4") ? "video/mp4" : "video/webm";
        const blob = new Blob(chunks, { type });
        setFile(
          new File([blob], `face-capture.${type === "video/mp4" ? "mp4" : "webm"}`, { type }),
        );
        setCamera(false);
        setRecording(false);
      };
      recorder.onerror = () => {
        recorder.onstop = null;
        close();
        setFile(null);
        setError("ضبط ناموفق بود. دوربین را باز کنید و دوباره ضبط کنید.");
      };
      recorder.start();
      setRecording(true);
      timerRef.current = setTimeout(() => {
        if (recorder.state === "recording") recorder.stop();
      }, 6000);
    } catch {
      close();
      setError(
        "این مرورگر از ضبط پشتیبانی نمی‌کند. از مرورگر دیگری با دسترسی به دوربین استفاده کنید.",
      );
    }
  };
  return {
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
  };
}
