"use client";

import { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { BarChart3, TrendingUp, Wallet, Sparkles, Search } from "lucide-react";
import { analyzePortfolio } from "@/lib/api";

const CHART_COLORS = [
  "#f59e0b",
  "#10b981",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#84cc16",
  "#f97316",
  "#6366f1",
  "#14b8a6",
  "#d946ef",
  "#facc15",
  "#0ea5e9",
  "#a3e635",
  "#a78bfa",
  "#2dd4bf",
  "#fb923c",
  "#818cf8",
  "#22c55e",
  "#7dd3fc",
];

const US_PRESET_TICKERS = [
  "SPY", "QQQ", "IVV", "VOO", "VTI", "VEA", 
  "VWO", "VUG", "VXUS", "VTV", "SOXX", "QLD", "SSO", "SCHD", "USD",
];

const KS_PRESET_TICKERS = [
  { ticker: "069500", name: "KODEX 200" },
  { ticker: "102110", name: "TIGER 200" },
  { ticker: "114800", name: "KODEX 인버스" },
  { ticker: "251340", name: "KODEX 코스닥150" },
  { ticker: "133690", name: "TIGER 코스닥150" },
  { ticker: "069660", name: "KOSEF 코스피200" },
  { ticker: "226490", name: "KODEX 코스피" },
  { ticker: "068270", name: "KODEX 200선물" },
];

export default function PortfolioPage() {
  const [usTickers, setUsTickers] = useState("SPY, QQQ");
  const [ksTickers, setKsTickers] = useState("069500");
  const [ksTickersDisplay, setKsTickersDisplay] = useState("KODEX 200");
  const [isDirectInput, setIsDirectInput] = useState(false);
  
  const getKsTickerName = (ticker: string) => {
    const cleanTicker = ticker.replace(/\.(KS|KQ)$/, "");
    const found = KS_PRESET_TICKERS.find(item => item.ticker === cleanTicker);
    return found ? found.name : ticker;
  };

  const [kqTickers, setKqTickers] = useState("");
  const [quantities, setQuantities] = useState<Record<string, number>>({
    SPY: 10,
    QQQ: 10,
    "069500.KS": 10,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Awaited<
    ReturnType<typeof analyzePortfolio>
  > | null>(null);

  const usList = usTickers
    .split(",")
    .map((t) => t.trim().toUpperCase())
    .filter(Boolean);
  const ksList = ksTickers
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  const kqList = kqTickers
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  const allTickers = [
    ...usList,
    ...ksList.map((t) => t + ".KS"),
    ...kqList.map((t) => t + ".KQ"),
  ];

  const handleQuantityChange = (ticker: string, value: number) => {
    setQuantities((prev) => ({ ...prev, [ticker]: value }));
  };

  const handleTickerRemove = (ticker: string) => {
    const cleanTicker = ticker.replace(/\.(KS|KQ)$/, "");
    
    if (ticker.includes(".KS")) {
      setKsTickers(prev => 
        prev.split(",").map(t => t.trim()).filter(t => t !== cleanTicker).join(", ")
      );
    } else {
      setUsTickers(prev => 
        prev.split(",").map(t => t.trim()).filter(t => t !== cleanTicker).join(", ")
      );
    }
    
    setQuantities(prev => {
      const newQuantities = { ...prev };
      delete newQuantities[ticker];
      return newQuantities;
    });
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

  useEffect(() => {
    handleAnalyze();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="flex items-center gap-3 text-2xl font-bold text-stone-100">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10">
            <BarChart3 className="h-5 w-5 text-amber-400" />
          </div>
          포트폴리오 분석
        </h1>
        <p className="mt-2 text-sm text-stone-500">
          보유 ETF를 입력하고 실제 종목별 노출 비중을 한눈에 확인하세요
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[400px_1fr]">
        <div className="rounded-2xl border border-stone-800/80 bg-stone-900/40 p-6 shadow-xl shadow-black/20 backdrop-blur-sm card-glow">
          <h3 className="mb-5 flex items-center gap-2 text-sm font-semibold text-amber-400">
            <Wallet className="h-4 w-4" />
            보유 수량 입력
          </h3>
          <div className="space-y-4">
            {/* 입력 모드 토글 */}
            <div className="mb-4 flex items-center justify-between">
              <p className="text-xs font-medium text-stone-500">
                {isDirectInput ? "ETF를 입력해주세요" : "종목을 드래그하여 아래에 추가하세요"}
              </p>
              <button
                onClick={() => setIsDirectInput(!isDirectInput)}
                className="rounded-lg bg-stone-700/50 px-2 py-1 text-xs text-stone-400 hover:bg-stone-600/50 hover:text-stone-300 transition-colors"
              >
                {isDirectInput ? "드래그 모드" : "직접 입력"}
              </button>
            </div>

            {!isDirectInput && (
            <div className="mb-4 space-y-3">
              
              {/* 미국 종목 */}
              <div>
                <p className="mb-1.5 text-xs text-stone-600">미국 ETF</p>
                <div className="flex flex-wrap gap-1.5">
                  {US_PRESET_TICKERS.map((ticker) => {
                    const alreadyAdded = usList.includes(ticker);
                    return (
                      <span
                        key={ticker}
                        draggable={!alreadyAdded}
                        onDragStart={(e) => {
                          e.dataTransfer.setData("ticker", ticker);
                          e.dataTransfer.setData("region", "us");
                          e.dataTransfer.effectAllowed = "copy";
                        }}
                        onClick={() => {
                          if (isDirectInput && !alreadyAdded) {
                            const updated = usTickers.trim()
                              ? `${usTickers}, ${ticker}`
                              : ticker;
                            setUsTickers(updated);
                            setQuantities((prev) => ({ ...prev, [ticker]: 10 }));
                          } else if (alreadyAdded) {
                            const updated = usList.filter(t => t !== ticker).join(", ");
                            setUsTickers(updated);
                            setQuantities(prev => {
                              const newQuantities = { ...prev };
                              delete newQuantities[ticker];
                              return newQuantities;
                            });
                          }
                        }}
                        className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                          alreadyAdded
                            ? "border border-amber-500/30 bg-amber-500/10 text-amber-400/60 cursor-pointer hover:bg-red-500/10 hover:border-red-500/30"
                            : isDirectInput 
                              ? "border border-stone-700 bg-stone-800/80 text-stone-300 hover:border-amber-500/40 hover:bg-stone-800 cursor-pointer"
                              : "border border-stone-700 bg-stone-800/80 text-stone-300 hover:border-amber-500/40 hover:bg-stone-800 cursor-grab active:cursor-grabbing"
                        }`}
                      >
                        {ticker}
                        {alreadyAdded && " ✓"}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* 한국 종목 */}
              <div>
                <p className="mb-1.5 text-xs text-stone-600">한국 ETF</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {KS_PRESET_TICKERS.map((item) => {
                    const alreadyAdded = ksList.includes(item.ticker);
                    return (
                      <span
                        key={item.ticker}
                        draggable={!alreadyAdded}
                        onDragStart={(e) => {
                          e.dataTransfer.setData("ticker", item.ticker);
                          e.dataTransfer.setData("region", "ks");
                          e.dataTransfer.effectAllowed = "copy";
                        }}
                        onClick={() => {
                          if (isDirectInput && !alreadyAdded) {
                            const updatedTickers = ksTickers.trim()
                              ? `${ksTickers}, ${item.ticker}`
                              : item.ticker;
                            const updatedDisplay = ksTickersDisplay.trim()
                              ? `${ksTickersDisplay}, ${item.name}`
                              : item.name;
                            setKsTickers(updatedTickers);
                            setKsTickersDisplay(updatedDisplay);
                            setQuantities((prev) => ({ ...prev, [item.ticker + ".KS"]: 10 }));
                          } else if (alreadyAdded) {
                            const updated = ksList.filter(t => t !== item.ticker).join(", ");
                            const updatedDisplay = updated.split(",").map(t => getKsTickerName(t.trim())).join(", ");
                            setKsTickers(updated);
                            setKsTickersDisplay(updatedDisplay);
                            setQuantities(prev => {
                              const newQuantities = { ...prev };
                              delete newQuantities[item.ticker + ".KS"];
                              return newQuantities;
                            });
                          }
                        }}
                        className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                          alreadyAdded
                            ? "border border-amber-500/30 bg-amber-500/10 text-amber-400/60 cursor-pointer hover:bg-red-500/10 hover:border-red-500/30"
                            : isDirectInput 
                              ? "border border-stone-700 bg-stone-800/80 text-stone-300 hover:border-amber-500/40 hover:bg-stone-800 cursor-pointer"
                              : "border border-stone-700 bg-stone-800/80 text-stone-300 hover:border-amber-500/40 hover:bg-stone-800 cursor-grab active:cursor-grabbing"
                        }`}
                      >
                        {item.name}
                        {alreadyAdded && " ✓"}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
            )}

            {isDirectInput && (
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-stone-500">
                    미국 (SPY, QQQ 등)
                  </label>
                  <textarea
                    value={usTickers}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      setUsTickers(newValue);
                      
                      // 새로 추가된 티커에 기본 수량 10 설정
                      const newTickers = newValue.split(",").map(t => t.trim().toUpperCase()).filter(Boolean);
                      const currentTickers = Object.keys(quantities).filter(t => !t.includes(".KS"));
                      newTickers.forEach(ticker => {
                        if (!currentTickers.includes(ticker)) {
                          setQuantities(prev => ({ ...prev, [ticker]: 10 }));
                        }
                      });
                    }}
                    rows={2}
                    className="w-full rounded-xl border border-stone-700/80 bg-stone-900/80 px-3 py-2.5 text-sm text-stone-200 placeholder:text-stone-600 transition-all focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20"
                    placeholder="SPY, QQQ"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-stone-500">
                    코스피 (KODEX 200 등)
                  </label>
                  <textarea
                    value={ksTickers}
                    onChange={(e) => setKsTickers(e.target.value)}
                    rows={2}
                    className="w-full rounded-xl border border-stone-700/80 bg-stone-900/80 px-3 py-2.5 text-sm text-stone-200 placeholder:text-stone-600 transition-all focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20"
                    placeholder="069500, 102110"
                  />
                </div>
              </div>
            )}
            {allTickers.length > 0 && (
              <div 
                className="space-y-3 rounded-xl border border-stone-800/60 bg-stone-900/50 p-3"
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "copy";
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  const ticker = e.dataTransfer.getData("ticker");
                  const region = e.dataTransfer.getData("region");
                  
                  if (!ticker) return;
                  
                  if (region === "us" && !usList.includes(ticker)) {
                    const updated = usTickers.trim()
                      ? `${usTickers}, ${ticker}`
                      : ticker;
                    setUsTickers(updated);
                    setQuantities((prev) => ({ ...prev, [ticker]: 10 }));
                  } else if (region === "ks" && !ksList.includes(ticker)) {
                    const tickerName = getKsTickerName(ticker);
                    const updatedDisplay = ksTickersDisplay.trim()
                      ? `${ksTickersDisplay}, ${tickerName}`
                      : tickerName;
                    const updatedTickers = ksTickers.trim()
                      ? `${ksTickers}, ${ticker}`
                      : ticker;
                    setKsTickersDisplay(updatedDisplay);
                    setKsTickers(updatedTickers);
                    setQuantities((prev) => ({ ...prev, [ticker + ".KS"]: 10 }));
                  }
                }}
              >
                <p className="text-xs font-medium text-stone-500">
                  종목별 수량
                </p>
                
                <div className="space-y-2">
                {allTickers.map((t) => (
                  <div
                    key={t}
                    className="flex items-center justify-between gap-2"
                  >
                    <span className="text-xs font-medium text-stone-400">
                      {isDirectInput 
                        ? t 
                        : (t.includes(".KS") ? getKsTickerName(t) : t)
                      }
                    </span>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={0}
                        value={quantities[t] > 0 ? quantities[t] : ""}
                        placeholder="0"
                        onChange={(e) =>
                          handleQuantityChange(
                            t,
                            Math.max(0, parseInt(e.target.value) || 0)
                          )
                        }
                        className="w-20 rounded-lg border border-stone-700 bg-stone-900 px-2.5 py-1.5 text-right text-sm tabular-nums text-stone-200 placeholder:text-stone-600 focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20"
                      />
                      <button
                        onClick={() => handleTickerRemove(t)}
                        className="flex h-4 w-4 items-center justify-center rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors text-xs"
                        title="종목 제거"
                      >
                        −
                      </button>
                    </div>
                  </div>
                ))}
                </div>
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
                  <p className="text-xs font-medium text-stone-500">
                    총 투자액 (₩)
                  </p>
                  <p className="mt-1 text-2xl font-bold tabular-nums text-amber-400">
                    {result.total_invested_krw.toLocaleString("ko-KR", {
                      maximumFractionDigits: 0,
                    })}{" "}
                    ₩
                  </p>
                </div>
                <div className="rounded-2xl border border-stone-800/80 bg-stone-900/40 p-6 shadow-xl shadow-black/20 backdrop-blur-sm card-glow">
                  <p className="text-xs font-medium text-stone-500">
                    총 투자액 ($)
                  </p>
                  <p className="mt-1 text-2xl font-bold tabular-nums text-amber-400">
                    $
                    {result.total_invested_usd.toLocaleString("en-US", {
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
                <div className="overflow-hidden rounded-2xl border border-stone-800/80 bg-stone-900/40 shadow-xl shadow-black/20 backdrop-blur-sm card-glow">
                  <div className="border-b border-stone-800/80 bg-stone-900/60 px-5 py-4">
                    <h3 className="font-semibold text-stone-200">
                      종목별 노출 현황
                    </h3>
                    <p className="mt-0.5 text-xs text-stone-500">
                      실제 보유 종목의 금액과 비중
                    </p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-stone-800/80 bg-stone-900/40">
                          <th className="px-5 py-3.5 text-left text-xs font-medium text-stone-500">
                            종목명
                          </th>
                          <th className="px-5 py-3.5 text-right text-xs font-medium text-stone-500">
                            금액($)
                          </th>
                          <th className="px-5 py-3.5 text-right text-xs font-medium text-stone-500">
                            금액(₩)
                          </th>
                          <th className="px-5 py-3.5 text-right text-xs font-medium text-stone-500">
                            비중
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.exposures.map((e, i) => (
                          <tr
                            key={e.name}
                            className={`border-b border-stone-800/50 transition-colors hover:bg-stone-800/30 ${
                              i % 2 === 0 ? "bg-stone-900/20" : ""
                            }`}
                          >
                            <td className="px-5 py-3 font-medium">
                              <a
                                href={`https://finance.yahoo.com/quote/${e.name}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-amber-400 hover:text-amber-300 hover:underline transition-colors"
                              >
                                {e.name}
                              </a>
                            </td>
                            <td className="px-5 py-3 text-right tabular-nums text-stone-300">
                              $
                              {e.amount_usd.toLocaleString("en-US", {
                                maximumFractionDigits: 2,
                              })}
                            </td>
                            <td className="px-5 py-3 text-right tabular-nums text-stone-300">
                              {e.amount_krw.toLocaleString("ko-KR", {
                                maximumFractionDigits: 0,
                              })}
                              ₩
                            </td>
                            <td className="px-5 py-3 text-right font-semibold tabular-nums text-amber-400">
                              {e.weight_pct.toFixed(1)}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="rounded-2xl border border-stone-800/80 bg-stone-900/40 p-6 shadow-xl shadow-black/20 backdrop-blur-sm card-glow">
                  <h3 className="mb-4 font-semibold text-stone-200">
                    비중 시각화
                  </h3>
                  <p className="mb-4 text-xs text-stone-500">
                    종목별 투자액 비율
                  </p>
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
                            <Cell
                              key={i}
                              fill={CHART_COLORS[i % CHART_COLORS.length]}
                              stroke="none"
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(v, name, props) =>
                            props?.payload?.weight_pct != null
                              ? `${props.payload.weight_pct.toFixed(1)}%`
                              : ""
                          }
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
