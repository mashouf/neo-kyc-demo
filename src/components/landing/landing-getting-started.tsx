import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cta } from "./styles";

export function LandingGettingStarted() {
  return (
    <section id="getting-started" className="bg-section text-content">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-10 sm:py-20 lg:grid-cols-2 lg:gap-24">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-soft">
            فصل تازه زندگی شما{" "}
          </p>
          <h2 className="mt-5 text-4xl font-medium leading-[1.1] tracking-[-0.045em] sm:text-5xl">
            یک شروع تازه. <br /> در چند قدم ساده.{" "}
          </h2>
          <Link href="/kyc" className={`${cta} mt-8`}>
            شروع کنیم <ArrowRight className="size-4" />
          </Link>
        </div>
        <ol className="space-y-7">
          {[
            {
              title: "آشنایی اولیه",
              description: "شماره همراه خود را تأیید کنید و کمی از خودتان بگویید.",
            },
            {
              title: "حساب دلخواه شما",
              description:
                "نشانی را وارد کنید، حساب را انتخاب کنید و مراحل احراز هویت را انجام دهید.",
            },
            {
              title: "یک نگاه نهایی",
              description: "اطلاعاتتان را مرور کنید و درخواست افتتاح حساب را بفرستید.",
            },
          ].map(({ title, description }, index) => (
            <li
              key={title}
              className="flex gap-5 border-b border-inverse/15 pb-7 last:border-0 last:pb-0"
            >
              <span className="pt-1 font-mono text-xs text-brand-soft">0{index + 1}</span>
              <div>
                <h3 className="text-lg font-medium">{title}</h3>
                <p className="mt-2 max-w-sm text-sm leading-6 text-content-muted">{description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
