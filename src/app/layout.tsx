import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Global ETF Master 2026",
  description: "글로벌 ETF 포트폴리오 분석 및 구성 종목 조회",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${outfit.variable} font-sans antialiased`}>
        <div className="relative flex min-h-screen bg-stone-950 text-stone-100 bg-grid-pattern">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-stone-950 via-stone-950 to-amber-950/10" aria-hidden />
          <Sidebar />
          <main className="relative flex-1 overflow-auto p-6 lg:p-8 lg:pl-10">{children}</main>
        </div>
      </body>
    </html>
  );
}
