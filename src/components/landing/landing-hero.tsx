import Image from "next/image";
import Link from "next/link";
import { ArrowDownLeft, ArrowUpRight, ShieldCheck, Sparkles } from "lucide-react";
import { cta } from "./styles";

export function LandingHero() {
  return (
    <section className="mx-auto grid max-w-7xl items-center gap-6 px-5 pb-12 pt-8 sm:px-10 sm:pt-14 lg:grid-cols-[1.05fr_1fr] lg:gap-10 lg:pb-20">
      <div className="relative z-10">
        <p className="mb-6 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em]">
          <span className="size-2 rounded-full bg-brand-dot" /> نگاهی تازه به بانکداری{" "}
        </p>
        <h1 className="max-w-2xl text-[clamp(2.4rem,5.5vw,5rem)] font-medium leading-[1.5] tracking-[-0.065em]">
          زندگی جاری‌ست. <br />
          پول شما هم <br />
          <span className="font-bold text-brand"> همراهش باشد. </span>
        </h1>
        <p className="mt-7 max-w-sm text-base leading-7 text-content-muted">
          با نئون بانک آشنا شوید؛ نگاهی تازه به بانکداری دیجیتال برای فصل بعدی زندگی شما. ساده‌تر،
          با فرصت‌های بیشتر.{" "}
        </p>
        <Link href="/kyc" className={`${cta} mt-8`}>
          فصل تازه‌تان را شروع کنید <ArrowUpRight className="size-5" />
        </Link>
        <p className="mt-4 flex items-center gap-2 text-xs text-content-muted">
          <ShieldCheck className="size-4" /> قدم‌به‌قدم همراه شما؛ از شروع تا بررسی نهایی.{" "}
        </p>
      </div>
      <div
        className="relative isolate mx-auto mt-8 flex min-h-[440px] w-full max-w-[550px] items-center justify-center rounded-[2.5rem] bg-showcase sm:min-h-[535px] lg:mt-0"
        aria-label="نمایش کارت و حساب نئون بانک"
      >
        <div aria-hidden="true" className="absolute inset-0 overflow-hidden rounded-[2.5rem]">
          <div className="bank-orbit bank-orbit-one" />
          <div className="bank-orbit bank-orbit-two" />
          <span className="absolute bottom-8 left-7 text-[10px] font-medium uppercase tracking-[0.2em] text-content-muted">
            برای روزهای پیش رو{" "}
          </span>
        </div>
        <div className="relative -mt-8 -ml-12 w-[53%] max-w-[270px] rotate-[-10deg] drop-shadow-bank-card sm:-ml-20">
          <Image
            src="/neon-card.png"
            alt="کارت نئون بانک با طرح مشکی و بنفش"
            width={674}
            height={1086}
            priority
            className="h-auto w-full rounded-[1.8rem]"
          />
        </div>
        <div className="absolute bottom-16 right-4 w-[73%] max-w-[290px] rotate-[5deg] rounded-2xl border border-inverse/15 bg-feature-identity/96 p-5 shadow-account-preview sm:right-3 sm:p-6">
          <div className="flex items-center justify-between text-xs text-preview-label">
            <span> حساب روزمره شما </span>
            <span className="rounded-full bg-preview-muted px-2 py-1 text-[9px]"> پیش‌نمایش </span>
          </div>
          <p className="mt-3 text-3xl font-medium tracking-tight">
            ۴٬۲۸۰<span className="text-xl text-content-subtle">٫۵۰ دلار</span>
          </p>
          <div className="my-4 flex h-10 items-end gap-1.5" aria-hidden="true">
            {[25, 38, 33, 48, 40, 58, 54, 67, 61, 78, 72, 95, 88, 100].map((height, i) => (
              <span
                key={i}
                className="flex-1 rounded-t-sm bg-chart"
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
          <div className="flex items-center gap-3 border-t border-preview-outline pt-3">
            <span className="grid size-8 place-items-center rounded-full bg-preview-muted">
              <ArrowDownLeft className="size-4" />
            </span>
            <div className="flex-1">
              <p className="text-xs font-semibold"> فرصتی برای رشد </p>
              <p className="mt-1 text-[10px] text-content-muted"> نمایش فعالیت حساب </p>
            </div>
            <Sparkles className="size-4 text-brand-soft" />
          </div>
        </div>
        <span className="absolute right-5 top-9 grid size-12 rotate-12 place-items-center rounded-2xl bg-brand-soft text-on-brand shadow-lg sm:right-10 sm:top-12">
          <ArrowUpRight className="size-6" />
        </span>
      </div>
    </section>
  );
}
