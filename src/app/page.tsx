"use client";

import { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { analyzePortfolio } from "@/lib/api";

const CHART_COLORS = [
  "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#ec4899",
  "#06b6d4", "#84cc16", "#f97316", "#6366f1", "#14b8a6",
];

export default function PortfolioPage() {
  const [usTickers, setUsTickers] = useState("QLD, USD");
  const [ksTickers, setKsTickers] = useState("069500");
  const [kqTickers, setKqTickers] = useState("");
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Awaited<ReturnType<typeof analyzePortfolio>> | null>(null);

  const usList = usTickers.split(",").map((t) => t.trim().toUpperCase()).filter(Boolean);
  const ksList = ksTickers.split(",").map((t) => t.trim()).filter(Boolean);
  const kqList = kqTickers.split(",").map((t) => t.trim()).filter(Boolean);

  const allTickers = [
    ...usList,
    ...ksList.map((t) => t + ".KS"),
    ...kqList.map((t) => t + ".KQ"),
  ];

  const handleQuantityChange = (ticker: string, value: number) => {
    setQuantities((prev) => ({ ...prev, [ticker]: value }));
  };

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const body = {
        us_tickers: usList,
        ks_tickers: ksList,
        kq_tickers: kqList,
        quantities,
      };
      const data = await analyzePortfolio(body);
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "분석 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const totalQty = Object.values(quantities).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-stone-100">
        내 글로벌 포트폴리오 분석
      </h1>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <div className="rounded-xl border border-stone-800 bg-stone-900/50 p-6">
          <h3 className="mb-4 text-sm font-semibold text-amber-400">보유 수량 입력</h3>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-xs text-stone-500">미국 (QLD, USD 등)</label>
              <textarea
                value={usTickers}
                onChange={(e) => setUsTickers(e.target.value)}
                rows={2}
                className="w-full rounded-lg border border-stone-700 bg-stone-900 px-3 py-2 text-sm text-stone-200 placeholder:text-stone-500"
                placeholder="QLD, USD"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-stone-500">코스피 (069500 등)</label>
              <textarea
                value={ksTickers}
                onChange={(e) => setKsTickers(e.target.value)}
                rows={2}
                className="w-full rounded-lg border border-stone-700 bg-stone-900 px-3 py-2 text-sm text-stone-200 placeholder:text-stone-500"
                placeholder="069500"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-stone-500">코스닉</label>
              <textarea
                value={kqTickers}
                onChange={(e) => setKqTickers(e.target.value)}
                rows={2}
                className="w-full rounded-lg border border-stone-700 bg-stone-900 px-3 py-2 text-sm text-stone-200 placeholder:text-stone-500"
                placeholder=""
              />
            </div>
            <div className="space-y-2">
              {allTickers.map((t) => (
                <div key={t} className="flex items-center justify-between gap-2">
                  <span className="text-xs text-stone-400">{t}</span>
                  <input
                    type="number"
                    min={0}
                    value={quantities[t] ?? 0}
                    onChange={(e) => handleQuantityChange(t, Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-20 rounded border border-stone-700 bg-stone-900 px-2 py-1 text-right text-sm"
                  />
                </div>
              ))}
            </div>
            <button
              onClick={handleAnalyze}
              disabled={loading || totalQty === 0}
              className="w-full rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-stone-950 transition-colors hover:bg-amber-400 disabled:opacity-50"
            >
              {loading ? "분석 중..." : "분석 실행"}
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {error && (
            <div className="rounded-lg border border-red-800 bg-red-950/50 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {result && (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-stone-800 bg-stone-900/50 p-6">
                  <p className="text-xs text-stone-500">총 투자액 (₩)</p>
                  <p className="text-2xl font-bold text-amber-400">
                    {result.total_invested_krw.toLocaleString("ko-KR", { maximumFractionDigits: 0 })} ₩
                  </p>
                </div>
                <div className="rounded-xl border border-stone-800 bg-stone-900/50 p-6">
                  <p className="text-xs text-stone-500">총 투자액 ($)</p>
                  <p className="text-2xl font-bold text-amber-400">
                    ${result.total_invested_usd.toLocaleString("en-US", { maximumFractionDigits: 2 })}
                  </p>
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
                <div className="overflow-hidden rounded-xl border border-stone-800 bg-stone-900/50">
                  <div className="border-b border-stone-800 px-4 py-3">
                    <h3 className="font-medium text-stone-200">종목별 노출 현황</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-stone-800">
                          <th className="px-4 py-3 text-left text-stone-500">종목명</th>
                          <th className="px-4 py-3 text-right text-stone-500">금액($)</th>
                          <th className="px-4 py-3 text-right text-stone-500">금액(₩)</th>
                          <th className="px-4 py-3 text-right text-stone-500">비중</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.exposures.map((e) => (
                          <tr key={e.name} className="border-b border-stone-800/50">
                            <td className="px-4 py-3 text-stone-200">{e.name}</td>
                            <td className="px-4 py-3 text-right">${e.amount_usd.toLocaleString("en-US", { maximumFractionDigits: 2 })}</td>
                            <td className="px-4 py-3 text-right">{e.amount_krw.toLocaleString("ko-KR", { maximumFractionDigits: 0 })}₩</td>
                            <td className="px-4 py-3 text-right text-amber-400">{e.weight_pct.toFixed(1)}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="rounded-xl border border-stone-800 bg-stone-900/50 p-6">
                  <h3 className="mb-4 font-medium text-stone-200">비중 시각화</h3>
                  <div className="h-[320px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={result.exposures}
                          dataKey="amount_usd"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={2}
                        >
                          {result.exposures.map((_, i) => (
                            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(v) => (v != null ? `$${Number(v).toLocaleString("en-US", { maximumFractionDigits: 2 })}` : "")} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
