"use client";

import { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from "recharts";
import { BarChart3, TrendingUp, Wallet, Sparkles, Search, Plus, X, Trash2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { analyzePortfolio, getUsEtfs, type USEtfItem } from "@/lib/api";
import { getKsEtfs, type KsEtfItem } from "@/lib/api-ks-etfs";

const CHART_COLORS = [
  "#3182f6",
  "#00c853",
  "#f59e0b",
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

const CustomXAxisTick = (props: any) => {
  const { x, y, payload, remainingStocks, onHover, onLeave } = props;
  const isLastTick = remainingStocks && remainingStocks.length > 0;

  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dy={16}
        textAnchor="end"
        fill="#8b95a1"
        fontSize={9}
        transform="rotate(-45)"
        style={{ cursor: isLastTick ? "pointer" : "default" }}
        onMouseEnter={isLastTick ? onHover : undefined}
        onMouseLeave={isLastTick ? onLeave : undefined}
      >
        {payload?.value}
      </text>
    </g>
  );
};

const KS_DISPLAY_PER_CATEGORY = 4;

const EtfChipGroup = ({
  items,
  selectedIds,
  onToggle,
  onAddClick,
}: {
  items: { id: string; label: string; data?: any }[];
  selectedIds: string[];
  onToggle: (id: string, data?: any) => void;
  onAddClick: () => void;
}) => {
  const checkedItems = items.filter((item) => selectedIds.includes(item.id));
  const uncheckedItems = items.filter((item) => !selectedIds.includes(item.id));

  return (
    <div className="flex flex-wrap gap-1.5 mb-3">
      {[...checkedItems, ...uncheckedItems].map((item) => {
        const alreadyAdded = selectedIds.includes(item.id);
        return (
          <span
            key={item.id}
            onClick={() => onToggle(item.id, item.data)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all cursor-pointer ${alreadyAdded
                ? "bg-toss-blue-light text-toss-blue border border-toss-blue/20"
                : "bg-toss-gray-100 text-toss-gray-600 hover:bg-toss-gray-200"
              }`}
          >
            {item.label}
            {alreadyAdded && " ✓"}
          </span>
        );
      })}
      <button
        onClick={onAddClick}
        className="flex items-center gap-1 rounded-full bg-toss-blue-light px-3 py-1.5 text-xs font-medium text-toss-blue hover:bg-toss-blue/15 transition-colors"
      >
        <Plus className="h-3 w-3" />
        추가
      </button>
    </div>
  );
};

export default function PortfolioPage() {
  const [usTickers, setUsTickers] = useState("");
  const [ksTickers, setKsTickers] = useState("");
  const [ksTickersDisplay, setKsTickersDisplay] = useState("");
  const [isDirectInput, setIsDirectInput] = useState(false);
  const [showUsSearch, setShowUsSearch] = useState(false);
  const [usSearchQuery, setUsSearchQuery] = useState("");
  const [chartType, setChartType] = useState<"donut" | "bar">("donut");
  const [currencyView, setCurrencyView] = useState<"usd" | "krw">("usd");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showRemainingTooltip, setShowRemainingTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [ksEtfList, setKsEtfList] = useState<KsEtfItem[]>([]);
  const [showKsSearch, setShowKsSearch] = useState(false);
  const [ksSearchQuery, setKsSearchQuery] = useState("");
  const [usEtfList, setUsEtfList] = useState<USEtfItem[]>([]);

  useEffect(() => {
    getKsEtfs().then(setKsEtfList).catch(() => { });
    getUsEtfs().then(setUsEtfList).catch(() => { });
  }, []);

  const getKsTickerName = (ticker: string) => {
    const cleanTicker = ticker.replace(/\.(KS|KQ)$/, "");
    const found = ksEtfList.find(item => item.ticker === cleanTicker);
    return found ? found.name : ticker;
  };

  const ksTab1 = ksEtfList.filter((item) => item.etfTabCode === 1);
  const ksTab4 = ksEtfList.filter((item) => item.etfTabCode === 4);
  const ksDisplayTab1 = ksTab1.slice(0, KS_DISPLAY_PER_CATEGORY);
  const ksDisplayTab4 = ksTab4.slice(0, KS_DISPLAY_PER_CATEGORY);
  const ksRemainingTab1 = ksTab1.slice(KS_DISPLAY_PER_CATEGORY);
  const ksRemainingTab4 = ksTab4.slice(KS_DISPLAY_PER_CATEGORY);
  const ksAllRemaining = [...ksRemainingTab1, ...ksRemainingTab4];
  const filteredKsRemaining = ksAllRemaining.filter(
    (item) =>
      item.name.toLowerCase().includes(ksSearchQuery.toLowerCase()) ||
      item.ticker.includes(ksSearchQuery)
  );

  const filteredUsEtfs = usEtfList.filter(etf =>
    etf.Symbol.toLowerCase().includes(usSearchQuery.toLowerCase()) ||
    etf.Name.toLowerCase().includes(usSearchQuery.toLowerCase())
  );

  const handleAddUsEtf = (ticker: string) => {
    if (!usList.includes(ticker)) {
      const currentList = usList.filter(Boolean);
      const updated = [...currentList, ticker].join(", ");
      setUsTickers(updated);
      setQuantities(prev => ({ ...prev, [ticker]: 10 }));
    }
    setShowUsSearch(false);
    setUsSearchQuery("");
  };

  const handleAddKsEtf = (item: KsEtfItem) => {
    if (!ksList.includes(item.ticker)) {
      const updatedTickers = ksTickers.trim()
        ? `${ksTickers}, ${item.ticker}`
        : item.ticker;
      const updatedDisplay = ksTickersDisplay.trim()
        ? `${ksTickersDisplay}, ${item.name}`
        : item.name;
      setKsTickers(updatedTickers);
      setKsTickersDisplay(updatedDisplay);
      setQuantities((prev) => ({ ...prev, [item.ticker + ".KS"]: 10 }));
    }
    setShowKsSearch(false);
    setKsSearchQuery("");
  };


  const [kqTickers, setKqTickers] = useState("");
  const [quantities, setQuantities] = useState<Record<string, number>>({});
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

  // 페이지 진입 시 자동 분석 제거 - 사용자가 직접 "분석 실행" 클릭 시에만 요청

  return (
    <div className="space-y-8">
      <div>
        <h1 className="flex items-center gap-3 text-2xl font-bold text-toss-gray-900">
          <Link href="/" className="flex h-10 w-10 items-center justify-center rounded-2xl bg-toss-gray-100 hover:bg-toss-gray-200 transition-colors">
            <ArrowLeft className="h-5 w-5 text-toss-gray-600" />
          </Link>
          포트폴리오 분석
        </h1>
        <p className="mt-2 text-sm text-toss-gray-500">
          보유 ETF를 입력하고 실제 종목별 노출 비중을 한눈에 확인하세요
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[400px_1fr]">
        <div className="card-toss p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="flex items-center gap-2 text-sm font-bold text-toss-gray-900">
                <Wallet className="h-4 w-4 text-toss-blue" />
                보유 수량 입력
              </h3>
              <p className="mt-1 text-xs text-toss-gray-500">
                {isDirectInput ? "ETF를 입력해주세요" : "종목을 체크하여 추가하세요"}
              </p>
            </div>
          </div>
          <div className="space-y-4">

            {!isDirectInput && (
              <div className="mb-4 space-y-3">

                <div>
                  <p className="mb-2 text-xs font-semibold text-toss-gray-500">미국 ETF</p>

                  <EtfChipGroup
                    items={[...new Set([...US_PRESET_TICKERS, ...usList])].map(ticker => ({
                      id: ticker,
                      label: ticker,
                      data: ticker,
                    }))}
                    selectedIds={usList}
                    onToggle={(id) => {
                      const alreadyAdded = usList.includes(id);
                      if (alreadyAdded) {
                        const updated = usList.filter(t => t !== id).join(", ");
                        setUsTickers(updated);
                        setQuantities(prev => {
                          const newQuantities = { ...prev };
                          delete newQuantities[id];
                          return newQuantities;
                        });
                      } else {
                        const updated = usTickers.trim()
                          ? `${usTickers}, ${id}`
                          : id;
                        setUsTickers(updated);
                        setQuantities((prev) => ({ ...prev, [id]: 10 }));
                      }
                    }}
                    onAddClick={() => setShowUsSearch(true)}
                  />

                  {showUsSearch && (
                    <div className="relative mb-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Search className="h-4 w-4 text-toss-gray-400" />
                        <input
                          type="text"
                          value={usSearchQuery}
                          onChange={(e) => setUsSearchQuery(e.target.value)}
                          placeholder="ETF 검색 (티커, 종목명)"
                          className="flex-1 rounded-xl border border-toss-gray-200 bg-white px-3 py-2 text-xs text-toss-gray-900 placeholder:text-toss-gray-400 focus:border-toss-blue focus:ring-2 focus:ring-toss-blue/20 focus:outline-none"
                          autoFocus
                        />
                        <button
                          onClick={() => {
                            setShowUsSearch(false);
                            setUsSearchQuery("");
                          }}
                          className="flex h-6 w-6 items-center justify-center rounded-full bg-toss-gray-100 text-toss-gray-500 hover:bg-toss-gray-200"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>

                      <div className="max-h-48 overflow-y-auto rounded-xl border border-toss-gray-200 bg-white shadow-lg">
                        {filteredUsEtfs.slice(0, 20).map((etf) => {
                          const highlightName = (name: string, query: string) => {
                            if (!query) {
                              return name;
                            }

                            const regex = new RegExp(`(${query})`, 'gi');
                            const parts = name.split(regex);

                            return parts.map((part, index) =>
                              regex.test(part) ? (
                                <span key={index} className="text-toss-blue font-semibold">{part}</span>
                              ) : part
                            );
                          };

                          return (
                            <div
                              key={etf.Symbol}
                              onClick={() => handleAddUsEtf(etf.Symbol)}
                              className="cursor-pointer border-b border-toss-gray-100 px-3 py-2.5 hover:bg-toss-gray-50 last:border-b-0 transition-colors"
                            >
                              <div>
                                <span className="font-mono text-xs font-bold text-toss-blue">{etf.Symbol}</span>
                                <span className="ml-2 text-xs text-toss-gray-700">
                                  {highlightName(etf.Name, usSearchQuery)}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                        {filteredUsEtfs.length === 0 && (
                          <div className="px-3 py-3 text-xs text-toss-gray-500">검색 결과가 없습니다</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

{/* 한국 ETF */}
                {/* <div>
                  <p className="mb-2 text-xs text-toss-gray-500">한국 ETF</p>
                  <EtfChipGroup
                    items={(() => {
                      const presets = [...ksDisplayTab1, ...ksDisplayTab4];
                      const itemsMap = new Map();
                      presets.forEach(p => itemsMap.set(p.ticker, { id: p.ticker, label: p.name, data: p }));

                      ksList.forEach(ticker => {
                        if (!itemsMap.has(ticker)) {
                          const found = ksEtfList.find(i => i.ticker === ticker);
                          itemsMap.set(ticker, {
                            id: ticker,
                            label: found ? found.name : getKsTickerName(ticker),
                            data: found || { ticker, name: getKsTickerName(ticker) }
                          });
                        }
                      });
                      return Array.from(itemsMap.values());
                    })()}
                    selectedIds={ksList}
                    onToggle={(id, item) => {
                      const alreadyAdded = ksList.includes(id);
                      if (alreadyAdded) {
                        const updated = ksList.filter(t => t !== id).join(", ");
                        const updatedDisplay = updated.split(",").map(t => getKsTickerName(t.trim())).join(", ");
                        setKsTickers(updated);
                        setKsTickersDisplay(updatedDisplay);
                        setQuantities(prev => {
                          const newQuantities = { ...prev };
                          delete newQuantities[id + ".KS"];
                          return newQuantities;
                        });
                      } else {
                        handleAddKsEtf(item);
                      }
                    }}
                    onAddClick={() => setShowKsSearch(true)}
                  />
                  {showKsSearch && (
                    <div className="relative mb-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Search className="h-4 w-4 text-toss-gray-400" />
                        <input
                          type="text"
                          value={ksSearchQuery}
                          onChange={(e) => setKsSearchQuery(e.target.value)}
                          placeholder="ETF 검색 (티커, 종목명)"
                          className="flex-1 rounded-xl border border-toss-gray-200 bg-white px-3 py-2 text-xs text-toss-gray-900 placeholder:text-toss-gray-400 focus:border-toss-blue focus:ring-2 focus:ring-toss-blue/20 focus:outline-none"
                          autoFocus
                        />
                        <button
                          onClick={() => {
                            setShowKsSearch(false);
                            setKsSearchQuery("");
                          }}
                          className="flex h-6 w-6 items-center justify-center rounded-full bg-toss-gray-100 text-toss-gray-500 hover:bg-toss-gray-200"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="max-h-48 overflow-y-auto rounded-xl border border-toss-gray-200 bg-white shadow-lg">
                        {filteredKsRemaining.slice(0, 20).map((item) => {
                          const highlightName = (name: string, query: string) => {
                            if (!query) {
                              return name;
                            }

                            const regex = new RegExp(`(${query})`, 'gi');
                            const parts = name.split(regex);

                            return parts.map((part, index) =>
                              regex.test(part) ? (
                                <span key={index} className="text-toss-blue font-semibold">{part}</span>
                              ) : part
                            );
                          };

                          return (
                            <div
                              key={item.ticker}
                              onClick={() => handleAddKsEtf(item)}
                              className="cursor-pointer border-b border-toss-gray-100 px-3 py-2.5 hover:bg-toss-gray-50 last:border-b-0 transition-colors"
                            >
                              <div>
                                <span className="font-mono text-xs font-bold text-toss-blue">{item.ticker}</span>
                                <span className="ml-2 text-xs text-toss-gray-700">
                                  {highlightName(item.name, ksSearchQuery)}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                        {filteredKsRemaining.length === 0 && (
                          <div className="px-3 py-3 text-xs text-toss-gray-500">검색 결과가 없습니다</div>
                        )}
                      </div>
                    </div>
                  )}
                </div> */}
              </div>
            )}

            {isDirectInput && (
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-toss-gray-600">
                    미국 (SPY, QQQ 등)
                  </label>
                  <textarea
                    value={usTickers}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      setUsTickers(newValue);

                      const newTickers = newValue.split(",").map(t => t.trim().toUpperCase()).filter(Boolean);
                      const currentTickers = Object.keys(quantities).filter(t => !t.includes(".KS"));
                      newTickers.forEach(ticker => {
                        if (!currentTickers.includes(ticker)) {
                          setQuantities(prev => ({ ...prev, [ticker]: 10 }));
                        }
                      });
                    }}
                    rows={2}
                    className="w-full rounded-xl border border-toss-gray-200 bg-white px-3 py-2.5 text-sm text-toss-gray-900 placeholder:text-toss-gray-400 transition-all focus:border-toss-blue focus:ring-2 focus:ring-toss-blue/20 focus:outline-none"
                    placeholder="SPY, QQQ"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-toss-gray-600">
                    코스피 (KODEX 200 등)
                  </label>
                  <textarea
                    value={ksTickers}
                    onChange={(e) => setKsTickers(e.target.value)}
                    rows={2}
                    className="w-full rounded-xl border border-toss-gray-200 bg-white px-3 py-2.5 text-sm text-toss-gray-900 placeholder:text-toss-gray-400 transition-all focus:border-toss-blue focus:ring-2 focus:ring-toss-blue/20 focus:outline-none"
                    placeholder="069500, 102110"
                  />
                </div>
              </div>
            )}
            {allTickers.length > 0 && (
              <div
                className="space-y-3 rounded-2xl bg-toss-gray-50 p-4"
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
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-toss-gray-600">
                    종목별 수량
                  </p>
                  {allTickers.length > 0 && (
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="flex items-center gap-1 text-xs font-medium text-[#f04452] hover:text-[#d63341] transition-colors"
                    >
                      <Trash2 className="h-3 w-3" />
                      전체 삭제
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  {allTickers.map((t) => (
                    <div
                      key={t}
                      className="flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleTickerRemove(t)}
                          className="flex h-5 w-5 items-center justify-center rounded-full bg-red-50 text-[#f04452] hover:bg-red-100 transition-colors text-xs"
                          title="종목 제거"
                        >
                          −
                        </button>
                        <span className="text-xs font-medium text-toss-gray-700">
                          {isDirectInput
                            ? t
                            : (t.includes(".KS") ? getKsTickerName(t) : t)
                          }
                        </span>
                      </div>
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
                        className="w-20 rounded-xl border border-toss-gray-200 bg-white px-2.5 py-1.5 text-right text-sm tabular-nums text-toss-gray-900 placeholder:text-toss-gray-400 focus:border-toss-blue focus:ring-2 focus:ring-toss-blue/20 focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {showDeleteConfirm && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
                <div className="mx-4 w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl">
                  <div className="mb-5 text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
                      <Trash2 className="h-6 w-6 text-[#f04452]" />
                    </div>
                    <h3 className="text-lg font-bold text-toss-gray-900">전체 삭제</h3>
                    <p className="mt-2 text-sm text-toss-gray-500">
                      모든 종목을 삭제하시겠습니까?
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="flex-1 rounded-xl bg-toss-gray-100 px-4 py-3 text-sm font-semibold text-toss-gray-700 hover:bg-toss-gray-200 transition-colors"
                    >
                      아니요
                    </button>
                    <button
                      onClick={() => {
                        setUsTickers("");
                        setKsTickers("");
                        setKsTickersDisplay("");
                        setKqTickers("");
                        setQuantities({});
                        setShowDeleteConfirm(false);
                      }}
                      className="flex-1 rounded-xl bg-[#f04452] px-4 py-3 text-sm font-semibold text-white hover:bg-[#d63341] transition-colors"
                    >
                      삭제하기
                    </button>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={handleAnalyze}
              disabled={loading || totalQty === 0}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-toss-blue px-4 py-3.5 text-sm font-bold text-white transition-all hover:bg-[#2272eb] active:scale-[0.98] disabled:opacity-40"
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
            <div className="rounded-2xl bg-red-50 px-5 py-4 text-sm text-[#f04452] font-medium">
              {error}
            </div>
          )}

          {result && (
            <>
              <div className="card-toss overflow-hidden">
                <div className="border-b border-toss-gray-200 px-5 py-4 flex items-center justify-between">
                  <h3 className="font-semibold text-toss-gray-900">총 투자액</h3>
                  <p className="text-xs text-toss-gray-500">
                    환율 {result.exchange_rate.toLocaleString("ko-KR", { maximumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="px-5 py-4">
                  <div>
                    <p className="text-[10px] text-toss-gray-400 tracking-wide mb-1">KRW</p>
                    <p className="text-[22px] font-bold tabular-nums tracking-tight text-toss-gray-900">
                      {result.total_invested_krw.toLocaleString("ko-KR", {
                        maximumFractionDigits: 0,
                      })} <span className="text-base text-toss-gray-400">₩</span>
                    </p>
                  </div>
                  <div className="h-px bg-toss-gray-100 my-3" />
                  <div>
                    <p className="text-[10px] text-toss-gray-400 tracking-wide mb-1">USD</p>
                    <p className="text-[22px] font-semibold tabular-nums text-toss-gray-900">
                      {result.total_invested_usd.toLocaleString("en-US", {
                        maximumFractionDigits: 2,
                      })} <span className="text-base text-toss-gray-400">$</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
                <div className="card-toss overflow-hidden">
                  <div className="border-b border-toss-gray-200 px-5 py-4 flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-toss-gray-900">
                        종목별 노출 현황
                      </h3>
                      <p className="mt-0.5 text-xs text-toss-gray-500">
                        실제 보유 종목의 금액과 비중
                      </p>
                    </div>
                    <div className="flex items-center gap-1 rounded-full bg-toss-gray-100 p-1">
                      {[
                        { key: "usd", label: "외화 $" },
                        { key: "krw", label: "원화 ₩" },
                      ].map(({ key, label }) => (
                        <button
                          key={key}
                          onClick={() => setCurrencyView(key as "usd" | "krw")}
                          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${currencyView === key
                              ? "bg-white text-toss-blue shadow-sm"
                              : "text-toss-gray-500 hover:text-toss-gray-700"
                            }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-toss-gray-200">
                          <th className="px-5 py-3.5 text-left text-xs font-semibold text-toss-gray-500">
                            종목명
                          </th>
                          <th className="px-5 py-3.5 text-right text-xs font-semibold text-toss-gray-500">
                            {currencyView === "usd" ? "금액($)" : "금액(₩)"}
                          </th>
                          <th className="px-5 py-3.5 text-right text-xs font-semibold text-toss-gray-500">
                            비중
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.exposures.map((e, i) => (
                          <tr
                            key={e.name}
                            className="border-b border-toss-gray-100 transition-colors hover:bg-toss-gray-50"
                          >
                            <td className="px-5 py-3 font-medium">
                              {e.name === "기타(미분류)" ? (
                                <span className="text-toss-gray-500">기타</span>
                              ) : (
                                <a
                                  href={`https://finance.yahoo.com/quote/${e.name}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-toss-blue hover:underline transition-colors"
                                >
                                  {e.name}
                                </a>
                              )}
                            </td>
                            <td className="px-5 py-3 text-right tabular-nums text-toss-gray-700">
                              {currencyView === "usd"
                                ? `$${e.amount_usd.toLocaleString("en-US", { maximumFractionDigits: 2 })}`
                                : `${e.amount_krw.toLocaleString("ko-KR", { maximumFractionDigits: 0 })}₩`
                              }
                            </td>
                            <td className="px-5 py-3 text-right font-bold tabular-nums text-toss-blue">
                              {e.weight_pct.toFixed(2)}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {showRemainingTooltip && result && (
                  <div
                    className="fixed z-50 max-w-xs rounded-2xl bg-white p-4 text-xs text-toss-gray-700 shadow-lg border border-toss-gray-200"
                    style={{
                      left: tooltipPosition.x - 10,
                      top: tooltipPosition.y - 10,
                      transform: 'translate(-100%, -100%)'
                    }}
                  >
                    <div className="font-semibold text-toss-blue mb-2">더 보기:</div>
                    <div className="space-y-1.5">
                      {result.exposures.filter(e => e.name !== "기타(미분류)").slice(15).map((e, i) => (
                        <div key={i} className="flex justify-between gap-4">
                          <span>{e.name}</span>
                          <span className="text-toss-blue font-medium">{e.weight_pct.toFixed(2)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="card-toss overflow-hidden">
                  <div className="border-b border-toss-gray-200 px-5 py-4 flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-toss-gray-900">분석 차트</h3>
                      <p className="mt-0.5 text-xs text-toss-gray-500">개별종목 구성</p>
                    </div>
                    <div className="flex items-center gap-1 rounded-full bg-toss-gray-100 p-1">
                      {[
                        { key: "donut", label: "도넛" },
                        { key: "bar", label: "막대" }
                      ].map(({ key, label }) => (
                        <button
                          key={key}
                          onClick={() => setChartType(key as "donut" | "bar")}
                          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${chartType === key
                              ? "bg-white text-toss-blue shadow-sm"
                              : "text-toss-gray-500 hover:text-toss-gray-700"
                            }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="px-5 py-4">
                    {chartType === "bar" ? (
                      <div style={{ height: Math.max(300, (() => {
                        const filteredData = result.exposures.filter(e => e.name !== "기타(미분류)");
                        return Math.min(filteredData.length, 15) * 36 + 40;
                      })()) }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            layout="vertical"
                            data={(() => {
                              const filteredData = result.exposures.filter(e => e.name !== "기타(미분류)");
                              const displayData = filteredData.slice(0, 15).map(e => ({
                                ...e,
                                name: e.name === "기타(미분류)" ? "기타" : e.name
                              }));
                              const remainingCount = filteredData.length - 15;
                              if (remainingCount > 0) {
                                displayData[displayData.length - 1] = {
                                  ...displayData[displayData.length - 1],
                                  name: displayData[displayData.length - 1].name + ` (+${remainingCount}개)`
                                };
                              }
                              return displayData;
                            })()}
                            margin={{ left: 10, right: 40 }}
                          >
                            <XAxis
                              type="number"
                              tick={{ fontSize: 10, fill: "#8b95a1" }}
                              tickFormatter={(value) => `${value.toFixed(1)}%`}
                              axisLine={false}
                              tickLine={false}
                            />
                            <YAxis
                              type="category"
                              dataKey="name"
                              tick={{ fontSize: 11, fill: "#4e5968", fontWeight: 500 }}
                              width={80}
                              axisLine={false}
                              tickLine={false}
                            />
                            <Tooltip
                              cursor={{ fill: "rgba(49,130,246,0.04)" }}
                              formatter={(v: any, name: any, props: any) =>
                                props?.payload?.weight_pct != null
                                  ? `${props.payload.weight_pct.toFixed(2)}%`
                                  : ""
                              }
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
                            <Bar dataKey="weight_pct" fill="#3182f6" radius={[0, 6, 6, 0]} barSize={20} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      (() => {
                        const chartData = result.exposures.slice(0, 15).map(e => ({
                          ...e,
                          name: e.name === "기타(미분류)" ? "기타" : e.name,
                          isEtc: e.name === "기타(미분류)",
                        }));
                        const remainingCount = result.exposures.length - 15;
                        if (remainingCount > 0) {
                          const rest = result.exposures.slice(15);
                          const restSum = rest.reduce((sum, e) => sum + e.amount_usd, 0);
                          const restWeightSum = rest.reduce((sum, e) => sum + e.weight_pct, 0);
                          chartData.push({
                            name: `기타 ${remainingCount}개`,
                            amount_usd: restSum,
                            amount_krw: 0,
                            weight_pct: restWeightSum,
                            isEtc: true,
                          } as any);
                        }
                        return (
                          <div className="flex items-start gap-6">
                            <div className="shrink-0" style={{ width: 200, height: 200 }}>
                              <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                  <Pie
                                    data={chartData}
                                    dataKey="amount_usd"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={90}
                                    paddingAngle={2}
                                  >
                                    {chartData.map((item, i) => (
                                      <Cell
                                        key={i}
                                        fill={item.isEtc ? "#d1d6db" : CHART_COLORS[i % CHART_COLORS.length]}
                                        stroke="none"
                                      />
                                    ))}
                                  </Pie>
                                  <Tooltip
                                    formatter={(v: any, name: any, props: any) =>
                                      props?.payload?.weight_pct != null
                                        ? `${props.payload.weight_pct.toFixed(2)}%`
                                        : ""
                                    }
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
                                </PieChart>
                              </ResponsiveContainer>
                            </div>
                            <div className="flex-1 space-y-1.5 pt-2">
                              {chartData.map((item, i) => (
                                <div key={item.name} className="flex items-center gap-2">
                                  <span
                                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                                    style={{ backgroundColor: item.isEtc ? "#d1d6db" : CHART_COLORS[i % CHART_COLORS.length] }}
                                  />
                                  <span className={`flex-1 text-xs truncate ${item.isEtc ? "text-toss-gray-400" : "text-toss-gray-700"}`}>
                                    {item.name}
                                  </span>
                                  <span className={`text-xs font-semibold tabular-nums ${item.isEtc ? "text-toss-gray-400" : "text-toss-blue"}`}>
                                    {item.weight_pct.toFixed(2)}%
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })()
                    )}
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
