"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BarChart3, Search, TrendingUp, DollarSign } from "lucide-react";
import { getExchangeRate } from "@/lib/api";

export function Sidebar() {
  const pathname = usePathname();
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);

  useEffect(() => {
    getExchangeRate()
      .then((r) => setExchangeRate(r.rate))
      .catch(() => setExchangeRate(null));
  }, []);

  const links = [
    { href: "/", label: "포트폴리오 분석", icon: BarChart3 },
    { href: "/etf", label: "ETF 상세 딥다이브", icon: Search },
  ];

  return (
    <aside className="relative w-64 shrink-0 border-r border-stone-800/80 bg-stone-900/40 backdrop-blur-sm">
      <div className="flex h-full flex-col p-5">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 shadow-lg shadow-amber-500/20">
            <TrendingUp className="h-5 w-5 text-stone-950" />
          </div>
          <div>
            <h2 className="text-base font-bold tracking-tight text-stone-100">Global ETF</h2>
            <p className="text-[10px] font-medium text-amber-400/90">Master 2026</p>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-1">
          {links.map(({ href, label, icon: Icon }) => {
            const isActive =
              href === "/"
                ? pathname === "/"
                : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-amber-500/15 text-amber-400 shadow-inner"
                    : "text-stone-400 hover:bg-stone-800/80 hover:text-stone-200"
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-amber-400" : "text-stone-500 group-hover:text-stone-400"}`} />
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
              1$ = {exchangeRate.toLocaleString("ko-KR", { minimumFractionDigits: 2 })}₩
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}
