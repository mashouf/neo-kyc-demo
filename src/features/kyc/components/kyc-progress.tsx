"use client";
import { useEffect, useRef } from "react";
import { Check, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { steps, stepLabels, type Stage } from "../contracts";

export function KycProgress({ stage }: { stage: Stage }) {
  const currentRef = useRef<HTMLLIElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const index = stage === "complete" ? steps.length : steps.indexOf(stage);
  const progress = Math.round((index / steps.length) * 100);
  useEffect(() => {
    const nav = navRef.current;
    const current = currentRef.current;
    if (nav && current)
      nav.scrollBy({
        left:
          current.getBoundingClientRect().left +
          current.clientWidth / 2 -
          nav.getBoundingClientRect().left -
          nav.clientWidth / 2,
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      });
  }, [stage]);

  return (
    <aside className="min-w-0 lg:sticky lg:top-6" aria-label="پیشرفت درخواست">
      <div className="mb-4 flex items-center justify-between gap-3 text-xs">
        <span className="font-semibold text-content-secondary"> درخواست شما </span>
        <span className="text-brand-soft">{progress.toLocaleString("fa-IR")}٪</span>
      </div>
      <div
        role="progressbar"
        aria-label="پیشرفت احراز هویت"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
        className="mb-6 h-1.5 overflow-hidden rounded-full bg-track"
      >
        <div
          className="h-full rounded-full bg-brand-soft transition-[width] duration-500"
          style={{ width: `${progress.toLocaleString("fa-IR")}٪` }}
        />
      </div>
      <nav
        ref={navRef}
        aria-label="مراحل احراز هویت"
        className="relative overflow-x-auto pb-2 lg:overflow-visible"
      >
        <ol className="flex min-w-max gap-3 lg:min-w-0 lg:flex-col lg:gap-1">
          {steps.map((step, item) => {
            const done = item < index;
            const current = stage === step;
            return (
              <li
                key={step}
                ref={current ? currentRef : undefined}
                aria-current={current ? "step" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-xl p-3 pe-5 text-sm",
                  current && "bg-surface shadow-sm ring-1 ring-outline-strong/70",
                )}
              >
                <span
                  className={cn(
                    "grid size-8 shrink-0 place-items-center rounded-full border text-xs font-semibold",
                    done
                      ? "border-outline-brand bg-brand-selected text-on-brand-tint"
                      : current
                        ? "border-brand-soft bg-brand-soft text-on-brand"
                        : "border-outline text-content-subtle",
                  )}
                >
                  {done ? (
                    <Check className="size-4" />
                  ) : (
                    (item + 1).toLocaleString("fa-IR", { minimumIntegerDigits: 2 })
                  )}
                </span>
                <span
                  className={cn(
                    current
                      ? "font-semibold text-on-brand-tint"
                      : done
                        ? "text-content-soft"
                        : "text-content-subtle",
                  )}
                >
                  {stepLabels[step]}
                  {done && <span className="sr-only"> ، تکمیل شده </span>}
                </span>
              </li>
            );
          })}
        </ol>
      </nav>
      <div className="mt-7 hidden rounded-2xl border border-outline-brand bg-brand-tint/60 p-5 lg:block">
        <ShieldCheck className="mb-3 size-6 text-brand-soft" />
        <p className="text-sm font-semibold text-brand-content"> اطلاعات شما مهم است </p>
        <p className="mt-2 text-xs leading-5 text-on-brand-tint/70">
          اطلاعات درخواست شما در طول انجام مراحل در نشست شما نگهداری می‌شود.{" "}
        </p>
      </div>
    </aside>
  );
}
