import type { ReactNode } from "react";
import { KycHeader } from "@/features/kyc/components/kyc-header";
import { KycFooter } from "@/features/kyc/components/kyc-footer";

export default function KycLayout({ children }: { children: ReactNode }) {
  return (
    <div className="neon-kyc flex min-h-dvh flex-col bg-canvas text-content">
      <KycHeader />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-7 sm:px-8 sm:py-10">{children}</main>
      <KycFooter />
    </div>
  );
}
