import type { Metadata } from "next";
import localFont from "next/font/local";
import { Providers } from "./providers";
import "./globals.css";
const vazirmatn = localFont({
  src: "../../public/fonts/vazirmatn-variable.woff2",
  variable: "--font-vazirmatn",
  weight: "100 900",
  display: "swap",
});
export const metadata: Metadata = {
  title: "نئون بانک | بانکداری برای فصل تازه زندگی",
  description:
    "با نئون بانک، تجربه‌ای تازه از بانکداری دیجیتال داشته باشید و درخواست افتتاح حساب را آغاز کنید.",
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fa" dir="rtl" className={vazirmatn.variable}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
