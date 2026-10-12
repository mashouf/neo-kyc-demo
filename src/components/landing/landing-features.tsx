import { Wallet, Fingerprint, Globe2 } from "lucide-react";

export function LandingFeatures() {
  return (
    <section id="possibilities" className="mx-auto max-w-7xl px-5 py-20 sm:px-10 sm:py-24">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand">
            به سبک نئون بانک{" "}
          </p>
          <h2 className="text-4xl font-medium leading-tight tracking-[-0.045em] sm:text-5xl">
            بیشتر زندگی کنید. <br />
            <span className="font-bold text-brand"> کمتر درگیر بانک شوید. </span>
          </h2>
        </div>
        <p className="max-w-sm text-sm leading-7 text-content-muted">
          تجربه‌ای که برای چیزهای مهم زندگی شما جا باز می‌کند؛ برنامه‌ها، روزمرگی و آینده‌تان.{" "}
        </p>
      </div>
      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {[
          {
            icon: Wallet,
            number: "01",
            title: "جایی برای شروع",
            description:
              "حساب مناسب خود را انتخاب کنید و با مسیری روشن، فصل تازه‌تان را آغاز کنید.",
            color: "bg-feature-start",
          },
          {
            icon: Fingerprint,
            number: "02",
            title: "شما در مرکز توجه",
            description: "اطلاعات و مدارک خود را ثبت کنید و همه‌چیز را در یک مسیر ساده بررسی کنید.",
            color: "bg-feature-identity",
          },
          {
            icon: Globe2,
            number: "03",
            title: "ساخته‌شده برای دنیای شما",
            description:
              "با موبایل در مسیر یا روی صفحه بزرگ‌تر در خانه؛ تجربه‌ای متناسب با سبک زندگی شما.",
            color: "bg-feature-world",
          },
        ].map(({ icon: Icon, number, title, description, color }) => (
          <article key={number} className={`${color} rounded-[1.5rem] p-7 sm:p-8`}>
            <div className="mb-12 flex items-center justify-between">
              <Icon className="size-7" strokeWidth={1.3} />
              <span className="text-xs text-content-subtle">/{number}</span>
            </div>
            <h3 className="text-xl font-medium tracking-tight">{title}</h3>
            <p className="mt-3 text-sm leading-6 text-content-muted">{description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
