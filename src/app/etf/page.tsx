"use client";

import { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Search, Building2, DollarSign, BarChart3, FileText, Sparkles, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getETFDetail } from "@/lib/api";

const CHART_COLORS = [
  "#3182f6", "#00c853", "#f59e0b", "#8b5cf6", "#ec4899",
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
        <h1 className="flex items-center gap-3 text-2xl font-bold text-toss-gray-900">
          <Link href="/" className="flex h-10 w-10 items-center justify-center rounded-2xl bg-toss-gray-100 hover:bg-toss-gray-200 transition-colors">
            <ArrowLeft className="h-5 w-5 text-toss-gray-600" />
          </Link>
          개별 ETF 구성 종목 탐색기
        </h1>
        <p className="mt-2 text-sm text-toss-gray-500">
          특정 ETF의 속을 100% 비중으로 들여다봅니다
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-toss-gray-600">ETF 티커</label>
          <input
            type="text"
            value={ticker}
            onChange={(e) => setTicker(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="QQQ, SPY, 069500.KS"
            className="w-full min-w-0 rounded-xl border border-toss-gray-200 bg-white px-4 py-2.5 text-toss-gray-900 placeholder:text-toss-gray-400 transition-all focus:border-toss-blue focus:ring-2 focus:ring-toss-blue/20 focus:outline-none sm:w-72"
          />
        </div>
        <button
          onClick={handleSearch}
          disabled={loading}
          className="flex items-center gap-2 rounded-xl bg-toss-blue px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#2272eb] active:scale-[0.98] disabled:opacity-50"
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
        <div className="rounded-2xl bg-red-50 px-5 py-4 text-sm text-[#f04452] font-medium">
          {error}
        </div>
      )}

      {data && (
        <div className="space-y-6">
          <div className="card-toss p-6">
            <h2 className="mb-5 flex items-center gap-2 text-lg font-bold text-toss-gray-900">
              <BarChart3 className="h-5 w-5 text-toss-blue" />
              {data.long_name || data.ticker}
            </h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl bg-toss-gray-50 p-4">
                <p className="flex items-center gap-1.5 text-xs font-semibold text-toss-gray-500">
                  <DollarSign className="h-3.5 w-3.5" />
                  현재가
                </p>
                <p className="mt-2 text-xl font-bold tabular-nums text-toss-gray-900">
                  {isKorea
                    ? `${data.current_price.toLocaleString("ko-KR", { maximumFractionDigits: 0 })}₩`
                    : `$${data.current_price.toLocaleString("en-US", { maximumFractionDigits: 2 })}`}
                </p>
              </div>
              <div className="rounded-2xl bg-toss-gray-50 p-4">
                <p className="flex items-center gap-1.5 text-xs font-semibold text-toss-gray-500">
                  <Building2 className="h-3.5 w-3.5" />
                  운용사
                </p>
                <p className="mt-2 text-toss-gray-900 font-medium">{data.fund_family || "-"}</p>
              </div>
              <div className="rounded-2xl bg-toss-gray-50 p-4">
                <p className="flex items-center gap-1.5 text-xs font-semibold text-toss-gray-500">
                  <BarChart3 className="h-3.5 w-3.5" />
                  자산 규모
                </p>
                <p className="mt-2 font-bold tabular-nums text-toss-gray-900">
                  {data.total_assets
                    ? `$${data.total_assets.toLocaleString("en-US", { maximumFractionDigits: 0 })}`
                    : "-"}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
            <div className="card-toss overflow-hidden">
              <div className="border-b border-toss-gray-200 px-5 py-4">
                <h3 className="font-semibold text-toss-gray-900">구성 종목 리스트</h3>
                <p className="mt-0.5 text-xs text-toss-gray-500">Top Holdings 및 비중</p>
              </div>
              <div className="max-h-[400px] overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 z-10 bg-white">
                    <tr className="border-b border-toss-gray-200">
                      <th className="px-5 py-3.5 text-left text-xs font-semibold text-toss-gray-500">티커</th>
                      <th className="px-5 py-3.5 text-left text-xs font-semibold text-toss-gray-500">종목명</th>
                      <th className="px-5 py-3.5 text-right text-xs font-semibold text-toss-gray-500">비중</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.holdings.map((h, i) => (
                      <tr
                        key={`${h.ticker}-${h.name}`}
                        className="border-b border-toss-gray-100 transition-colors hover:bg-toss-gray-50"
                      >
                        <td className="px-5 py-3 font-mono text-xs">
                          <a
                            href={`https://finance.yahoo.com/quote/${h.ticker}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-toss-blue hover:underline transition-colors"
                          >
                            {h.ticker}
                          </a>
                        </td>
                        <td className="px-5 py-3 font-medium text-toss-gray-900">{h.name}</td>
                        <td className="px-5 py-3 text-right font-semibold tabular-nums text-toss-blue">{h.weight_pct.toFixed(2)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="card-toss p-6">
              <h3 className="mb-1 font-semibold text-toss-gray-900">전체 비중 시각화</h3>
              <p className="mb-4 text-xs text-toss-gray-500">구성 종목별 비중 분포</p>
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
                          backgroundColor: "#ffffff",
                          border: "1px solid #e5e8eb",
                          borderRadius: "12px",
                          boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                          padding: "10px 14px",
                        }}
                        itemStyle={{ color: "#3182f6" }}
                        labelStyle={{
                          color: "#191f28",
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
                            <span style={{ color: "#191f28" }}>
                              {value}
                              {isLastDisplayed && remainingCount > 0 && (
                                <span
                                  style={{ color: "#8b95a1", marginLeft: "8px", cursor: "pointer" }}
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

          {showRemainingTooltip && data && (
            <div
              className="fixed z-50 max-w-xs rounded-2xl bg-white p-4 text-xs text-toss-gray-700 shadow-lg border border-toss-gray-200"
              style={{
                left: tooltipPosition.x + 10,
                top: tooltipPosition.y - 10,
                transform: 'translateY(-100%)'
              }}
            >
              <div className="font-semibold text-toss-blue mb-2">더 보기:</div>
              <div className="space-y-1.5">
                {data.holdings.slice(15).map((h, i) => (
                  <div key={i} className="flex justify-between gap-4">
                    <span>{h.name}</span>
                    <span className="text-toss-blue font-medium">{h.weight_pct.toFixed(2)}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.summary && (
            <div className="card-toss p-6">
              <h3 className="mb-3 flex items-center gap-2 font-semibold text-toss-gray-900">
                <FileText className="h-4 w-4 text-toss-blue" />
                ETF 개요
              </h3>
              <p className="text-sm leading-relaxed text-toss-gray-600">{data.summary}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
