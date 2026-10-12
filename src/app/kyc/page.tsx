import type { Metadata } from "next";
import { KycFlow } from "@/features/kyc/kyc-flow";

export const metadata: Metadata = {
  title: "افتتاح حساب | نئون بانک",
  description: "درخواست افتتاح حساب نئون بانک را شروع یا ادامه دهید.",
};
export default function KycPage() {
  return <KycFlow />;
}
