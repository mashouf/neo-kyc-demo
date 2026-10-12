import Link from "next/link";
import { Fingerprint, LockKeyhole } from "lucide-react";

export function KycHeader() {
  return (
    <header className="border-b border-outline/70 bg-surface">
      <div className="mx-auto flex min-h-20 max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-8">
        <Link href="/" aria-label="صفحه اصلی نئون بانک" className="flex items-center gap-2.5">
          <span className="grid size-10 place-items-center rounded-xl bg-brand text-on-brand">
            <Fingerprint className="size-6" />
          </span>
          <span className="text-xl font-bold tracking-tight">
            نئون<span className="text-brand"> بانک</span>
          </span>
        </Link>
        <div className="flex items-center gap-2 text-xs font-medium text-content-muted">
          <LockKeyhole className="size-3.5 text-brand-soft" />
          <span> احراز هویت </span>
        </div>
      </div>
    </header>
  );
}
