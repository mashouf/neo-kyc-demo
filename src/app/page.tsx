import Link from "next/link";
import { Fingerprint, ArrowUpRight, Check } from "lucide-react";
import { LandingHero } from "@/components/landing/landing-hero";
import { LandingFeatures } from "@/components/landing/landing-features";
import { LandingGettingStarted } from "@/components/landing/landing-getting-started";

export default function Home() {
  return (
    <div className="neon-landing overflow-x-clip bg-canvas text-content">
      <header className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-6 sm:px-10">
        <Link
          href="/"
          aria-label="صفحه اصلی نئون بانک"
          className="flex items-center gap-2 text-2xl font-bold tracking-tight"
        >
          <Fingerprint className="size-8" />
          نئون بانک{" "}
        </Link>
        <nav
          aria-label="منوی اصلی"
          className="hidden items-center gap-8 text-sm font-medium md:flex"
        >
          <a href="#possibilities" className="hover:underline">
            دنیای نئون بانک{" "}
          </a>
          <a href="#getting-started" className="hover:underline">
            چطور شروع کنیم؟{" "}
          </a>
        </nav>
        <Link
          href="/kyc"
          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-content/20 px-4 text-xs font-semibold transition hover:bg-inverse/10 sm:px-5 sm:text-sm"
        >
          افتتاح حساب <ArrowUpRight className="size-4" />
        </Link>
      </header>
      <main>
        <LandingHero />
        <div className="border-y border-content/10">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-8 gap-y-4 px-5 py-5 text-xs font-medium text-content-muted sm:px-10">
            <p className="uppercase tracking-[0.16em] text-content-subtle">
              روزمرگی، ساده‌تر از همیشه{" "}
            </p>
            {[
              "دیجیتال از اولین قدم",
              "همراه شما در موبایل",
              "فصل تازه شما از اینجا شروع می‌شود",
            ].map((text) => (
              <span key={text} className="flex items-center gap-2">
                <Check className="size-4 text-brand-soft" />
                {text}
              </span>
            ))}
          </div>
        </div>
        <LandingFeatures />
        <LandingGettingStarted />
      </main>
      <footer className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-6 px-5 py-9 sm:px-10">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold">
          <Fingerprint className="size-6" />
          نئون بانک{" "}
        </Link>
        <p className="max-w-md text-xs leading-5 text-content-muted">
          نئون بانک یک نمونه مفهومی بانکداری دیجیتال است. کارت و موجودی نمایشی هستند و حساب واقعی
          افتتاح نمی‌شود.{" "}
        </p>
        <Link
          href="/kyc"
          className="inline-flex items-center gap-2 text-xs font-semibold hover:underline"
        >
          شروع افتتاح حساب <ArrowUpRight className="size-4" />
        </Link>
      </footer>
    </div>
  );
}
