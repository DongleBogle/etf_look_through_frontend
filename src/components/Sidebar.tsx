"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
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
    { href: "/", label: "포트폴리오 분석" },
    { href: "/etf", label: "ETF 상세 딥다이브" },
  ];

  return (
    <aside className="w-64 shrink-0 border-r border-stone-800 bg-stone-900/50">
      <div className="flex h-full flex-col p-4">
        <h2 className="mb-6 px-2 text-lg font-semibold text-amber-400">
          Global ETF Master
        </h2>
        <nav className="flex flex-1 flex-col gap-1">
          {links.map(({ href, label }) => {
            const isActive =
              href === "/"
                ? pathname === "/"
                : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-amber-500/20 text-amber-400"
                    : "text-stone-400 hover:bg-stone-800 hover:text-stone-200"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>
        {exchangeRate != null && (
          <div className="mt-4 border-t border-stone-800 pt-4">
            <p className="text-xs text-stone-500">실시간 환율</p>
            <p className="text-sm font-medium text-stone-300">
              1$ = {exchangeRate.toLocaleString("ko-KR", { minimumFractionDigits: 2 })}₩
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}
