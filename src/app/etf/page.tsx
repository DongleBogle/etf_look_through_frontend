"use client";

import { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Search, Building2, DollarSign, BarChart3, FileText, Sparkles } from "lucide-react";
import { getETFDetail } from "@/lib/api";

const CHART_COLORS = [
  "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#ec4899",
  "#06b6d4", "#84cc16", "#f97316", "#6366f1", "#14b8a6",
];

export default function ETFDetailPage() {
  const [ticker, setTicker] = useState("QQQ");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<Awaited<ReturnType<typeof getETFDetail>> | null>(null);
  const [showRemainingTooltip, setShowRemainingTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const handleSearch = async () => {
    if (!ticker.trim()) return;
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const res = await getETFDetail(ticker.trim().toUpperCase());
      setData(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "조회 실패");
    } finally {
      setLoading(false);
    }
  };

  const isKorea = data?.ticker?.endsWith(".KS") || data?.ticker?.endsWith(".KQ");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="flex items-center gap-3 text-2xl font-bold text-stone-100">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10">
            <Search className="h-5 w-5 text-amber-400" />
          </div>
          개별 ETF 구성 종목 탐색기
        </h1>
        <p className="mt-2 text-sm text-stone-500">
          특정 ETF의 속을 100% 비중으로 들여다봅니다
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-stone-500">ETF 티커</label>
          <input
            type="text"
            value={ticker}
            onChange={(e) => setTicker(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="QQQ, SPY, 069500.KS"
            className="w-full min-w-0 rounded-xl border border-stone-700/80 bg-stone-900/80 px-4 py-2.5 text-stone-200 placeholder:text-stone-600 transition-all focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 sm:w-72"
          />
        </div>
        <button
          onClick={handleSearch}
          disabled={loading}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-2.5 text-sm font-semibold text-stone-950 shadow-lg shadow-amber-500/25 transition-all hover:from-amber-400 hover:to-amber-500 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Sparkles className="h-4 w-4 animate-pulse" />
              조회 중...
            </>
          ) : (
            <>
              <Search className="h-4 w-4" />
              조회
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {data && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-stone-800/80 bg-stone-900/40 p-6 shadow-xl shadow-black/20 backdrop-blur-sm card-glow">
            <h2 className="mb-5 flex items-center gap-2 text-lg font-semibold text-amber-400">
              <BarChart3 className="h-5 w-5" />
              {data.long_name || data.ticker}
            </h2>
            <div className="grid gap-6 sm:grid-cols-3">
              <div className="rounded-xl border border-stone-800/60 bg-stone-900/50 p-4">
                <p className="flex items-center gap-1.5 text-xs font-medium text-stone-500">
                  <DollarSign className="h-3.5 w-3.5" />
                  현재가
                </p>
                <p className="mt-2 text-xl font-bold tabular-nums text-stone-200">
                  {isKorea
                    ? `${data.current_price.toLocaleString("ko-KR", { maximumFractionDigits: 0 })}₩`
                    : `$${data.current_price.toLocaleString("en-US", { maximumFractionDigits: 2 })}`}
                </p>
              </div>
              <div className="rounded-xl border border-stone-800/60 bg-stone-900/50 p-4">
                <p className="flex items-center gap-1.5 text-xs font-medium text-stone-500">
                  <Building2 className="h-3.5 w-3.5" />
                  운용사
                </p>
                <p className="mt-2 text-stone-200">{data.fund_family || "-"}</p>
              </div>
              <div className="rounded-xl border border-stone-800/60 bg-stone-900/50 p-4">
                <p className="flex items-center gap-1.5 text-xs font-medium text-stone-500">
                  <BarChart3 className="h-3.5 w-3.5" />
                  자산 규모
                </p>
                <p className="mt-2 font-semibold tabular-nums text-stone-200">
                  {data.total_assets
                    ? `$${data.total_assets.toLocaleString("en-US", { maximumFractionDigits: 0 })}`
                    : "-"}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
            <div className="overflow-hidden rounded-2xl border border-stone-800/80 bg-stone-900/40 shadow-xl shadow-black/20 backdrop-blur-sm card-glow">
              <div className="border-b border-stone-800/80 bg-stone-900/60 px-5 py-4">
                <h3 className="font-semibold text-stone-200">구성 종목 리스트</h3>
                <p className="mt-0.5 text-xs text-stone-500">Top Holdings 및 비중</p>
              </div>
              <div className="max-h-[400px] overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 z-10 bg-stone-900/95 backdrop-blur-sm">
                    <tr className="border-b border-stone-800/80">
                      <th className="px-5 py-3.5 text-left text-xs font-medium text-stone-500">티커</th>
                      <th className="px-5 py-3.5 text-left text-xs font-medium text-stone-500">종목명</th>
                      <th className="px-5 py-3.5 text-right text-xs font-medium text-stone-500">비중</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.holdings.map((h, i) => (
                      <tr
                        key={`${h.ticker}-${h.name}`}
                        className={`border-b border-stone-800/50 transition-colors hover:bg-stone-800/30 ${i % 2 === 0 ? "bg-stone-900/20" : ""}`}
                      >
                        <td className="px-5 py-3 font-mono text-xs">
                          <a
                            href={`https://finance.yahoo.com/quote/${h.ticker}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-amber-400 hover:text-amber-300 hover:underline transition-colors"
                          >
                            {h.ticker}
                          </a>
                        </td>
                        <td className="px-5 py-3 font-medium text-stone-200">{h.name}</td>
                        <td className="px-5 py-3 text-right font-semibold tabular-nums text-amber-400">{h.weight_pct.toFixed(2)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-2xl border border-stone-800/80 bg-stone-900/40 p-6 shadow-xl shadow-black/20 backdrop-blur-sm card-glow">
              <h3 className="mb-1 font-semibold text-stone-200">전체 비중 시각화</h3>
              <p className="mb-4 text-xs text-stone-500">구성 종목별 비중 분포</p>
              <div className="h-[360px]">
                <ResponsiveContainer width="100%" height="100%">
                  <>
                    <PieChart>
                      <Pie
                        data={data.holdings.slice(0, 15)}
                        dataKey="weight_pct"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={110}
                        paddingAngle={2}
                      >
                        {data.holdings.slice(0, 15).map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} stroke="none" />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(v) => (v != null ? `${Number(v).toFixed(2)}%` : "")}
                        contentStyle={{
                          backgroundColor: "rgba(28,25,23,0.95)",
                          border: "1px solid rgba(245,158,11,0.3)",
                          borderRadius: "12px",
                          boxShadow: "0 4px 20px rgba(245,158,11,0.15)",
                          padding: "10px 14px",
                        }}
                        itemStyle={{ color: "#fbbf24" }}
                        labelStyle={{
                          color: "#fafaf9",
                          fontWeight: 600,
                          marginBottom: "4px",
                        }}
                      />
                      <Legend 
                        wrapperStyle={{ fontSize: "12px" }}
                        formatter={(value, entry, index) => {
                          const isLastDisplayed = index === Math.min(15, data.holdings.length) - 1;
                          const remainingCount = data.holdings.length - 15;
                          
                          return (
                            <span style={{ color: "#fafaf9" }}>
                              {value}
                              {isLastDisplayed && remainingCount > 0 && (
                                <span 
                                  style={{ color: "#a8a29e", marginLeft: "8px", cursor: "pointer" }}
                                  onMouseEnter={(e) => {
                                    setShowRemainingTooltip(true);
                                    setTooltipPosition({ x: e.clientX, y: e.clientY });
                                  }}
                                  onMouseLeave={() => setShowRemainingTooltip(false)}
                                >
                                  +{remainingCount}개
                                </span>
                              )}
                            </span>
                          );
                        }}
                      />
                    </PieChart>
                  </>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* 커스텀 툴팁 */}
          {showRemainingTooltip && data && (
            <div 
              className="fixed z-50 max-w-xs rounded-lg border border-stone-700 bg-stone-900 p-3 text-xs text-stone-300 shadow-lg"
              style={{
                left: tooltipPosition.x + 10,
                top: tooltipPosition.y - 10,
                transform: 'translateY(-100%)'
              }}
            >
              <div className="font-medium text-amber-400 mb-2">더 보기:</div>
              <div className="space-y-1">
                {data.holdings.slice(15).map((h, i) => (
                  <div key={i} className="flex justify-between">
                    <span>{h.name}</span>
                    <span className="text-amber-400">{h.weight_pct.toFixed(2)}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.summary && (
            <div className="rounded-2xl border border-stone-800/80 bg-stone-900/40 p-6 shadow-xl shadow-black/20 backdrop-blur-sm card-glow">
              <h3 className="mb-3 flex items-center gap-2 font-semibold text-stone-200">
                <FileText className="h-4 w-4" />
                ETF 개요
              </h3>
              <p className="text-sm leading-relaxed text-stone-400">{data.summary}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
