"use client";

import { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
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
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-stone-100">
        개별 ETF 구성 종목 탐색기
      </h1>
      <p className="text-stone-400">
        특정 ETF의 속을 100% 비중으로 들여다봅니다.
      </p>

      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="mb-1 block text-xs text-stone-500">ETF 티커</label>
          <input
            type="text"
            value={ticker}
            onChange={(e) => setTicker(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="QQQ, SPY, 069500.KS"
            className="w-64 rounded-lg border border-stone-700 bg-stone-900 px-3 py-2 text-stone-200 placeholder:text-stone-500"
          />
        </div>
        <button
          onClick={handleSearch}
          disabled={loading}
          className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-stone-950 transition-colors hover:bg-amber-400 disabled:opacity-50"
        >
          {loading ? "조회 중..." : "조회"}
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-800 bg-red-950/50 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {data && (
        <div className="space-y-6">
          <div className="rounded-xl border border-stone-800 bg-stone-900/50 p-6">
            <h2 className="mb-4 text-lg font-semibold text-amber-400">
              {data.long_name || data.ticker}
            </h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <p className="text-xs text-stone-500">현재가</p>
                <p className="text-xl font-bold text-stone-200">
                  {isKorea
                    ? `${data.current_price.toLocaleString("ko-KR", { maximumFractionDigits: 0 })}₩`
                    : `$${data.current_price.toLocaleString("en-US", { maximumFractionDigits: 2 })}`}
                </p>
              </div>
              <div>
                <p className="text-xs text-stone-500">운용사</p>
                <p className="text-stone-200">{data.fund_family || "-"}</p>
              </div>
              <div>
                <p className="text-xs text-stone-500">자산 규모</p>
                <p className="text-stone-200">
                  {data.total_assets
                    ? `$${data.total_assets.toLocaleString("en-US", { maximumFractionDigits: 0 })}`
                    : "-"}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
            <div className="overflow-hidden rounded-xl border border-stone-800 bg-stone-900/50">
              <div className="border-b border-stone-800 px-4 py-3">
                <h3 className="font-medium text-stone-200">구성 종목 리스트</h3>
              </div>
              <div className="max-h-[400px] overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-stone-900">
                    <tr className="border-b border-stone-800">
                      <th className="px-4 py-3 text-left text-stone-500">티커</th>
                      <th className="px-4 py-3 text-left text-stone-500">종목명</th>
                      <th className="px-4 py-3 text-right text-stone-500">비중</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.holdings.map((h) => (
                      <tr key={`${h.ticker}-${h.name}`} className="border-b border-stone-800/50">
                        <td className="px-4 py-3 text-stone-400">{h.ticker}</td>
                        <td className="px-4 py-3 text-stone-200">{h.name}</td>
                        <td className="px-4 py-3 text-right text-amber-400">{h.weight_pct.toFixed(2)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-xl border border-stone-800 bg-stone-900/50 p-6">
              <h3 className="mb-4 font-medium text-stone-200">전체 비중 시각화</h3>
              <div className="h-[360px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.holdings}
                      dataKey="weight_pct"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={110}
                      paddingAngle={2}
                    >
                      {data.holdings.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => (v != null ? `${Number(v).toFixed(2)}%` : "")} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {data.summary && (
            <div className="rounded-xl border border-stone-800 bg-stone-900/50 p-6">
              <h3 className="mb-3 font-medium text-stone-200">ETF 개요</h3>
              <p className="text-sm leading-relaxed text-stone-400">{data.summary}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
