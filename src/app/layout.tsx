import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata = {
  title: 'ETF 구성종목 확인 | ETF 룩스루 (Look-Through) 보유종목 통합 조회',
  description:
    '여러 ETF를 보유했을 때 구성종목(보유종목)을 통합 조회하고, 중복 종목까지 반영해 실제 기업 주식 비중을 계산해주는 ETF 룩스루(look-through) 분석 도구입니다.',
  keywords: [
    'ETF 구성종목',
    'ETF 보유종목',
    'ETF 종목 확인',
    'ETF holdings',
    'ETF 룩스루',
    'look-through',
    'ETF 비중 계산',
    'ETF 포트폴리오 분석',
    'ETF 중복 보유',
    '주식 비중 분석',
  ],
  openGraph: {
    title: 'ETF 구성종목 확인 | ETF 룩스루 (Look-Through)',
    description:
      'ETF 구성종목(보유종목)을 통합 조회하고 실제 기업 주식 비중을 계산해보세요.',
    url: 'https://etf-look-through-frontend.vercel.app/',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${outfit.variable} font-sans antialiased`}>
        <div className="relative flex min-h-screen min-w-0 overflow-x-hidden bg-stone-950 text-stone-100 bg-grid-pattern">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-stone-950 via-stone-950 to-amber-950/10" aria-hidden />
          <Sidebar />
          <main className="relative min-w-0 flex-1 overflow-auto p-4 pt-14 md:p-6 md:pt-6 lg:p-8 lg:pl-10">{children}</main>
        </div>
      </body>
    </html>
  );
}
