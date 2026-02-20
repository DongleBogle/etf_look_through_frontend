"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BarChart3,
  Search,
  TrendingUp,
  DollarSign,
  Menu,
  X,
} from "lucide-react";
import { getExchangeRate } from "@/lib/api";

export function Sidebar() {
  const pathname = usePathname();
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    getExchangeRate()
      .then((r) => setExchangeRate(r.rate))
      .catch(() => setExchangeRate(null));
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const links = [
    { href: "/", label: "포트폴리오 분석", icon: BarChart3 },
    { href: "/etf", label: "개별 ETF 구성 종목 탐색기", icon: Search },
    { href: "/market", label: "글로벌 증시", icon: TrendingUp },
  ];

  const drawerContent = (
    <div className="flex h-full flex-col p-5">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 shadow-lg shadow-amber-500/20">
          <TrendingUp className="h-5 w-5 text-stone-950" />
        </div>
        <div>
          <h2 className="text-base font-bold tracking-tight text-stone-100">
            Global ETF
          </h2>
          <p className="text-[10px] font-medium text-amber-400/90">
            Master 2026
          </p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {links.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${isActive
                  ? "bg-amber-500/15 text-amber-400 shadow-inner"
                  : "text-stone-400 hover:bg-stone-800/80 hover:text-stone-200"
                }`}
            >
              <Icon
                className={`h-4 w-4 shrink-0 ${isActive
                    ? "text-amber-400"
                    : "text-stone-500 group-hover:text-stone-400"
                  }`}
              />
              {label}
            </Link>
          );
        })}
      </nav>

      {exchangeRate != null && (
        <div className="mt-4 rounded-xl border border-stone-800/60 bg-stone-900/50 px-4 py-3">
          <div className="flex items-center gap-2 text-xs text-stone-500">
            <DollarSign className="h-3.5 w-3.5" />
            실시간 환율
          </div>
          <p className="mt-1 text-sm font-semibold tabular-nums text-stone-200">
            1$ ={" "}
            {exchangeRate.toLocaleString("ko-KR", { minimumFractionDigits: 2 })}
            ₩
          </p>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* 모바일: 상단 고정 헤더 + 햄버거 */}
      <header className="fixed left-0 right-0 top-0 z-40 flex h-14 items-center justify-between border-b border-stone-800/80 bg-stone-950/95 px-4 backdrop-blur-sm md:hidden">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-amber-700">
            <TrendingUp className="h-4 w-4 text-stone-950" />
          </div>
          <span className="text-sm font-bold text-stone-100">Global ETF</span>
        </div>
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-xl text-stone-400 hover:bg-stone-800/80 hover:text-stone-200"
          aria-label="메뉴 열기"
        >
          <Menu className="h-5 w-5" />
        </button>
      </header>

      {/* 모바일: 드로어 백드롭 */}
      <div
        role="button"
        tabIndex={0}
        aria-label="메뉴 닫기"
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity md:hidden ${mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        onClick={() => setMobileOpen(false)}
        onKeyDown={(e) => e.key === "Escape" && setMobileOpen(false)}
      />

      {/* 사이드바: 모바일=슬라이드 드로어, 데스크톱=인라인 */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 shrink-0 border-r border-stone-800/80 bg-stone-900/95 shadow-xl transition-transform duration-200 ease-out md:static md:translate-x-0 md:bg-stone-900/40 md:shadow-none ${mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        aria-hidden={!mobileOpen}
      >
        <div className="absolute right-0 top-0 z-10 flex h-14 items-center pr-2 md:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-stone-400 hover:bg-stone-800/80 hover:text-stone-200"
            aria-label="메뉴 닫기"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="h-full overflow-y-auto pt-2 md:pt-0">
          {drawerContent}
        </div>
      </aside>
    </>
  );
}
