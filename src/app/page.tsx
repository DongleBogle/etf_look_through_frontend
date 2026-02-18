"use client";

import { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { BarChart3, TrendingUp, Wallet, Sparkles } from "lucide-react";
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
    <div className="space-y-8">
      <div>
        <h1 className="flex items-center gap-3 text-2xl font-bold text-stone-100">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10">
            <BarChart3 className="h-5 w-5 text-amber-400" />
          </div>
          내 글로벌 포트폴리오 분석
        </h1>
        <p className="mt-2 text-sm text-stone-500">
          보유 ETF를 입력하고 실제 종목별 노출 비중을 한눈에 확인하세요
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[340px_1fr]">
        <div className="rounded-2xl border border-stone-800/80 bg-stone-900/40 p-6 shadow-xl shadow-black/20 backdrop-blur-sm card-glow">
          <h3 className="mb-5 flex items-center gap-2 text-sm font-semibold text-amber-400">
            <Wallet className="h-4 w-4" />
            보유 수량 입력
          </h3>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-stone-500">미국 (SPY, QQQ 등)</label>
              <textarea
                value={usTickers}
                onChange={(e) => setUsTickers(e.target.value)}
                rows={2}
                className="w-full rounded-xl border border-stone-700/80 bg-stone-900/80 px-3 py-2.5 text-sm text-stone-200 placeholder:text-stone-600 transition-all focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20"
                placeholder="SPY, QQQ"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-stone-500">코스피 (069500 등)</label>
              <textarea
                value={ksTickers}
                onChange={(e) => setKsTickers(e.target.value)}
                rows={2}
                className="w-full rounded-xl border border-stone-700/80 bg-stone-900/80 px-3 py-2.5 text-sm text-stone-200 placeholder:text-stone-600 transition-all focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20"
                placeholder="069500"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-stone-500">코스닥</label>
              <textarea
                value={kqTickers}
                onChange={(e) => setKqTickers(e.target.value)}
                rows={2}
                className="w-full rounded-xl border border-stone-700/80 bg-stone-900/80 px-3 py-2.5 text-sm text-stone-200 placeholder:text-stone-600 transition-all focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20"
                placeholder=""
              />
            </div>
            {allTickers.length > 0 && (
              <div className="space-y-2 rounded-xl border border-stone-800/60 bg-stone-900/50 p-3">
                <p className="text-xs font-medium text-stone-500">종목별 수량</p>
                {allTickers.map((t) => (
                  <div key={t} className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-stone-400">{t}</span>
                    <input
                      type="number"
                      min={0}
                      value={quantities[t] ?? 0}
                      onChange={(e) => handleQuantityChange(t, Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-20 rounded-lg border border-stone-700 bg-stone-900 px-2.5 py-1.5 text-right text-sm tabular-nums text-stone-200 focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20"
                    />
                  </div>
                ))}
              </div>
            )}
            <button
              onClick={handleAnalyze}
              disabled={loading || totalQty === 0}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-3 text-sm font-semibold text-stone-950 shadow-lg shadow-amber-500/25 transition-all hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 disabled:hover:from-amber-500 disabled:hover:to-amber-600"
            >
              {loading ? (
                <>
                  <Sparkles className="h-4 w-4 animate-pulse" />
                  분석 중...
                </>
              ) : (
                <>
                  <TrendingUp className="h-4 w-4" />
                  분석 실행
                </>
              )}
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {error && (
            <div className="rounded-xl border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {result && (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-stone-800/80 bg-stone-900/40 p-6 shadow-xl shadow-black/20 backdrop-blur-sm card-glow">
                  <p className="text-xs font-medium text-stone-500">총 투자액 (₩)</p>
                  <p className="mt-1 text-2xl font-bold tabular-nums text-amber-400">
                    {result.total_invested_krw.toLocaleString("ko-KR", { maximumFractionDigits: 0 })} ₩
                  </p>
                </div>
                <div className="rounded-2xl border border-stone-800/80 bg-stone-900/40 p-6 shadow-xl shadow-black/20 backdrop-blur-sm card-glow">
                  <p className="text-xs font-medium text-stone-500">총 투자액 ($)</p>
                  <p className="mt-1 text-2xl font-bold tabular-nums text-amber-400">
                    ${result.total_invested_usd.toLocaleString("en-US", { maximumFractionDigits: 2 })}
                  </p>
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
                <div className="overflow-hidden rounded-2xl border border-stone-800/80 bg-stone-900/40 shadow-xl shadow-black/20 backdrop-blur-sm card-glow">
                  <div className="border-b border-stone-800/80 bg-stone-900/60 px-5 py-4">
                    <h3 className="font-semibold text-stone-200">종목별 노출 현황</h3>
                    <p className="mt-0.5 text-xs text-stone-500">실제 보유 종목의 금액과 비중</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-stone-800/80 bg-stone-900/40">
                          <th className="px-5 py-3.5 text-left text-xs font-medium text-stone-500">종목명</th>
                          <th className="px-5 py-3.5 text-right text-xs font-medium text-stone-500">금액($)</th>
                          <th className="px-5 py-3.5 text-right text-xs font-medium text-stone-500">금액(₩)</th>
                          <th className="px-5 py-3.5 text-right text-xs font-medium text-stone-500">비중</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.exposures.map((e, i) => (
                          <tr
                            key={e.name}
                            className={`border-b border-stone-800/50 transition-colors hover:bg-stone-800/30 ${i % 2 === 0 ? "bg-stone-900/20" : ""}`}
                          >
                            <td className="px-5 py-3 font-medium text-stone-200">{e.name}</td>
                            <td className="px-5 py-3 text-right tabular-nums text-stone-300">${e.amount_usd.toLocaleString("en-US", { maximumFractionDigits: 2 })}</td>
                            <td className="px-5 py-3 text-right tabular-nums text-stone-300">{e.amount_krw.toLocaleString("ko-KR", { maximumFractionDigits: 0 })}₩</td>
                            <td className="px-5 py-3 text-right font-semibold tabular-nums text-amber-400">{e.weight_pct.toFixed(1)}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="rounded-2xl border border-stone-800/80 bg-stone-900/40 p-6 shadow-xl shadow-black/20 backdrop-blur-sm card-glow">
                  <h3 className="mb-4 font-semibold text-stone-200">비중 시각화</h3>
                  <p className="mb-4 text-xs text-stone-500">종목별 투자액 비율</p>
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
                            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} stroke="none" />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(v) => (v != null ? `$${Number(v).toLocaleString("en-US", { maximumFractionDigits: 2 })}` : "")}
                          contentStyle={{ backgroundColor: "rgba(28,25,23,0.95)", border: "1px solid rgb(68,64,60)", borderRadius: "12px" }}
                          labelStyle={{ color: "#fafaf9" }}
                        />
                        <Legend wrapperStyle={{ fontSize: "12px" }} />
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
