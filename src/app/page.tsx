"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getIndices, IndicesResponse } from "@/lib/api";
import { BarChart3, Search, ChevronRight, TrendingUp, TrendingDown, Clock } from "lucide-react";

const MARKET_STATUS: Record<string, string> = {
  REGULAR: "정규장",
  PRE: "프리마켓",
  POST: "애프터마켓",
  POSTPOST: "장마감",
  CLOSED: "휴장일",
  PREPRE: "장마감",
};

export default function HomePage() {
  const [data, setData] = useState<IndicesResponse | null>(null);

  useEffect(() => {
    getIndices().then(setData).catch(() => {});
    const interval = setInterval(() => {
      getIndices().then(setData).catch(() => {});
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const formatNumber = (num: number, decimals = 2) =>
    new Intl.NumberFormat("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num);

  const getMarketStatus = (names: string[]) => {
    for (const name of names) {
      const info = data?.indices.find((i) => i.name === name);
      if (info) return info.market_state;
    }
    return null;
  };

  const renderIndex = (name: string) => {
    const info = data?.indices.find((i) => i.name === name);
    if (!info) return null;

    const isPositive = info.change > 0;
    const isNegative = info.change < 0;

    return (
      <div key={name} className="flex items-center justify-between py-3.5">
        <p className="text-sm font-semibold text-toss-gray-900">
          {name === "S&P500" ? "S&P 500" : name}
        </p>
        <div className="text-right">
          <p className="text-sm font-bold tabular-nums text-toss-gray-900">
            {formatNumber(info.current_price)}
          </p>
          <p
            className={`text-xs font-semibold tabular-nums ${
              isPositive
                ? "text-[#f04452]"
                : isNegative
                ? "text-toss-blue"
                : "text-toss-gray-400"
            }`}
          >
            {isPositive ? "+" : ""}
            {formatNumber(info.change)} ({isPositive ? "+" : ""}
            {formatNumber(info.change_percent)}%)
          </p>
        </div>
      </div>
    );
  };

  const features = [
    {
      href: "/portfolio",
      icon: BarChart3,
      title: "포트폴리오 분석",
      description: "보유 ETF의 실제 종목별 노출 비중을 한눈에 확인하세요",
      color: "bg-toss-blue",
      lightColor: "bg-toss-blue-light",
      iconColor: "text-toss-blue",
    },
    {
      href: "/etf",
      icon: Search,
      title: "개별 ETF 탐색기",
      description: "ETF 구성 종목과 비중을 100% 기준으로 분석합니다",
      color: "bg-emerald-500",
      lightColor: "bg-emerald-50",
      iconColor: "text-emerald-500",
    },
  ];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* 서비스 카드 */}
      <div>
        <h2 className="mb-3 text-[22px] font-bold text-toss-gray-900">ETF 분석</h2>
        <div className="space-y-3">
          {features.map(({ href, icon: Icon, title, description, lightColor, iconColor }) => (
            <Link key={href} href={href}>
              <div className="card-toss flex items-center gap-4 p-5 cursor-pointer">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${lightColor}`}>
                  <Icon className={`h-6 w-6 ${iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-bold text-toss-gray-900">{title}</p>
                  <p className="mt-0.5 text-xs text-toss-gray-500">{description}</p>
                </div>
                <ChevronRight className="h-5 w-5 shrink-0 text-toss-gray-300" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* 증시 */}
      <div className="flex items-end justify-between">
        <h2 className="text-[18px] font-bold text-toss-gray-900">글로벌 증시</h2>
        {(data?.cached_at ?? data?.indices?.[0]?.cached_at) && (
          <p className="flex items-center gap-1 text-xs text-toss-gray-400">
            <Clock className="h-3.5 w-3.5" />
            업데이트 {data?.cached_at ?? data?.indices?.[0]?.cached_at}
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* 한국 증시 */}
        <div className="card-toss p-5">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-bold text-toss-gray-400 tracking-wide">🇰🇷 한국</p>
            {data && (() => {
              const state = getMarketStatus(["코스피", "코스닥"]);
              if (!state) return null;
              return (
                <span className={`text-[11px] font-medium ${state === "REGULAR" ? "text-emerald-500" : "text-toss-gray-400"}`}>
                  {state === "REGULAR" && "● "}{MARKET_STATUS[state] || state}
                </span>
              );
            })()}
          </div>
          {data ? (
            <div className="divide-y divide-toss-gray-100">
              {renderIndex("코스피")}
              {renderIndex("코스닥")}
            </div>
          ) : (
            <div className="space-y-4 py-3">
              {[1, 2].map((i) => (
                <div key={i} className="flex justify-between animate-pulse">
                  <div className="h-5 w-20 rounded-lg bg-toss-gray-200" />
                  <div className="h-5 w-24 rounded-lg bg-toss-gray-200" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 미국 증시 */}
        <div className="card-toss p-5">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-bold text-toss-gray-400 tracking-wide">🇺🇸 미국</p>
            {data && (() => {
              const state = getMarketStatus(["S&P500", "나스닥", "다우존스"]);
              if (!state) return null;
              return (
                <span className={`text-[11px] font-medium ${state === "REGULAR" ? "text-emerald-500" : "text-toss-gray-400"}`}>
                  {state === "REGULAR" && "● "}{MARKET_STATUS[state] || state}
                </span>
              );
            })()}
          </div>
          {data ? (
            <div className="divide-y divide-toss-gray-100">
              {renderIndex("S&P500")}
              {renderIndex("나스닥")}
              {renderIndex("다우존스")}
            </div>
          ) : (
            <div className="space-y-4 py-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex justify-between animate-pulse">
                  <div className="h-5 w-20 rounded-lg bg-toss-gray-200" />
                  <div className="h-5 w-24 rounded-lg bg-toss-gray-200" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
