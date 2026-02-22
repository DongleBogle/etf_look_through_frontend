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
import { BarChart3, TrendingUp, Wallet, Sparkles, Search, Plus, X, Trash2 } from "lucide-react";
import { analyzePortfolio, getUsEtfs, type USEtfItem } from "@/lib/api";
import { getKsEtfs, type KsEtfItem } from "@/lib/api-ks-etfs";

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
        fill="#a8a29e"
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
            className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all cursor-pointer ${alreadyAdded
                ? "border border-amber-500/30 bg-amber-500/10 text-amber-400"
                : "border border-stone-700 bg-stone-800/80 text-stone-300 hover:border-amber-500/40 hover:bg-stone-800"
              }`}
          >
            {item.label}
            {alreadyAdded && " ✓"}
          </span>
        );
      })}
      <button
        onClick={onAddClick}
        className="flex items-center gap-1 rounded-lg bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-400 hover:bg-amber-500/20 transition-colors border border-amber-500/30"
      >
        <Plus className="h-3 w-3" />
        추가
      </button>
    </div>
  );
};

export default function PortfolioPage() {
  const [usTickers, setUsTickers] = useState("SPY, QQQ");
  const [ksTickers, setKsTickers] = useState("069500");
  const [ksTickersDisplay, setKsTickersDisplay] = useState("KODEX 200");
  const [isDirectInput, setIsDirectInput] = useState(false);
  const [showUsSearch, setShowUsSearch] = useState(false);
  const [usSearchQuery, setUsSearchQuery] = useState("");
  const [chartType, setChartType] = useState<"donut" | "bar">("donut");
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
          {/* 입력 모드 토글 */}
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="flex items-center gap-2 text-sm font-semibold text-amber-400">
                <Wallet className="h-4 w-4" />
                보유 수량 입력
              </h3>
              <p className="mt-1 text-xs font-medium text-stone-500">
                {isDirectInput ? "ETF를 입력해주세요" : "종목을 체크하여 추가하세요"}
              </p>
            </div>
            <button
              onClick={() => setIsDirectInput(!isDirectInput)}
              className="rounded-lg bg-stone-700/50 px-2 py-1 text-xs text-stone-400 hover:bg-stone-600/50 hover:text-stone-300 transition-colors"
            >
              {isDirectInput ? "체크 모드" : "직접 입력"}
            </button>
          </div>
          <div className="space-y-4">

            {!isDirectInput && (
              <div className="mb-4 space-y-3">

                {/* 미국 ETF */}
                <div>
                  <p className="mb-2 text-xs text-stone-600">미국 ETF</p>

                  {/* 모든 미국 ETF 칩들 (체크된 것들 먼저, 그 다음 체크 안된 것들) + 추가 버튼 */}
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

                  {/* 검색 드롭다운 */}
                  {showUsSearch && (
                    <div className="relative mb-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Search className="h-4 w-4 text-stone-500" />
                        <input
                          type="text"
                          value={usSearchQuery}
                          onChange={(e) => setUsSearchQuery(e.target.value)}
                          placeholder="ETF 검색 (티커, 이름)"
                          className="flex-1 rounded-lg border border-stone-700/80 bg-stone-900/80 px-3 py-2 text-xs text-stone-200 placeholder:text-stone-600 focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20"
                          autoFocus
                        />
                        <button
                          onClick={() => {
                            setShowUsSearch(false);
                            setUsSearchQuery("");
                          }}
                          className="flex h-6 w-6 items-center justify-center rounded-full bg-stone-700/50 text-stone-400 hover:bg-stone-600/50"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>

                      <div className="max-h-48 overflow-y-auto rounded-lg border border-stone-700/80 bg-stone-900/95">
                        {filteredUsEtfs.slice(0, 20).map((etf) => (
                          <div
                            key={etf.Symbol}
                            onClick={() => handleAddUsEtf(etf.Symbol)}
                            className="cursor-pointer border-b border-stone-800/50 px-3 py-2 hover:bg-stone-800/50 last:border-b-0"
                          >
                            <div>
                              <span className="font-mono text-xs font-semibold text-amber-400">{etf.Symbol}</span>
                              <span className="ml-2 text-xs text-stone-300">{etf.Name}</span>
                            </div>
                          </div>
                        ))}
                        {filteredUsEtfs.length === 0 && (
                          <div className="px-3 py-2 text-xs text-stone-500">검색 결과가 없습니다</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* 한국 ETF */}
                <div>
                  <p className="mb-2 text-xs text-stone-600">한국 ETF</p>
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
                        <Search className="h-4 w-4 text-stone-500" />
                        <input
                          type="text"
                          value={ksSearchQuery}
                          onChange={(e) => setKsSearchQuery(e.target.value)}
                          placeholder="ETF 검색 (티커, 이름)"
                          className="flex-1 rounded-lg border border-stone-700/80 bg-stone-900/80 px-3 py-2 text-xs text-stone-200 placeholder:text-stone-600 focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20"
                          autoFocus
                        />
                        <button
                          onClick={() => {
                            setShowKsSearch(false);
                            setKsSearchQuery("");
                          }}
                          className="flex h-6 w-6 items-center justify-center rounded-full bg-stone-700/50 text-stone-400 hover:bg-stone-600/50"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="max-h-48 overflow-y-auto rounded-lg border border-stone-700/80 bg-stone-900/95">
                        {filteredKsRemaining.slice(0, 20).map((item) => (
                          <div
                            key={item.ticker}
                            onClick={() => handleAddKsEtf(item)}
                            className="cursor-pointer border-b border-stone-800/50 px-3 py-2 hover:bg-stone-800/50 last:border-b-0"
                          >
                            <div>
                              <span className="font-mono text-xs font-semibold text-amber-400">{item.ticker}</span>
                              <span className="ml-2 text-xs text-stone-300">{item.name}</span>
                            </div>
                          </div>
                        ))}
                        {filteredKsRemaining.length === 0 && (
                          <div className="px-3 py-2 text-xs text-stone-500">검색 결과가 없습니다</div>
                        )}
                      </div>
                    </div>
                  )}
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
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-stone-500">
                    종목별 수량
                  </p>
                  {allTickers.length > 0 && (
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition-colors"
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
                          className="flex h-4 w-4 items-center justify-center rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors text-xs"
                          title="종목 제거"
                        >
                          −
                        </button>
                        <span className="text-xs font-medium text-stone-400">
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
                        className="w-20 rounded-lg border border-stone-700 bg-stone-900 px-2.5 py-1.5 text-right text-sm tabular-nums text-stone-200 placeholder:text-stone-600 focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 삭제 확인 팝업 */}
            {showDeleteConfirm && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                <div className="mx-4 w-full max-w-sm rounded-2xl border border-stone-800 bg-stone-900 p-6 shadow-xl">
                  <div className="mb-4 text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
                      <Trash2 className="h-6 w-6 text-red-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-stone-200">전체 삭제</h3>
                    <p className="mt-2 text-sm text-stone-400">
                      모든 종목을 삭제하시겠습니까?
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="flex-1 rounded-lg border border-stone-600 bg-stone-700/50 px-4 py-2.5 text-sm font-medium text-stone-300 hover:bg-stone-600/50 transition-colors"
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
                      className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-500 transition-colors"
                    >
                      예
                    </button>
                  </div>
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
                            className={`border-b border-stone-800/50 transition-colors hover:bg-stone-800/30 ${i % 2 === 0 ? "bg-stone-900/20" : ""
                              }`}
                          >
                            <td className="px-5 py-3 font-medium">
                              {e.name === "기타(미분류)" ? (
                                <span className="text-amber-400">기타</span>
                              ) : (
                                <a
                                  href={`https://finance.yahoo.com/quote/${e.name}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-amber-400 hover:text-amber-300 hover:underline transition-colors"
                                >
                                  {e.name}
                                </a>
                              )}
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

                {/* 커스텀 툴팁 */}
                {showRemainingTooltip && result && (
                  <div
                    className="fixed z-50 max-w-xs rounded-lg border border-stone-700 bg-stone-900 p-3 text-xs text-stone-300 shadow-lg"
                    style={{
                      left: tooltipPosition.x - 10,
                      top: tooltipPosition.y - 10,
                      transform: 'translate(-100%, -100%)'
                    }}
                  >
                    <div className="font-medium text-amber-400 mb-2">더 보기:</div>
                    <div className="space-y-1">
                      {result.exposures.filter(e => e.name !== "기타(미분류)").slice(15).map((e, i) => (
                        <div key={i} className="flex justify-between">
                          <span>{e.name}</span>
                          <span className="text-amber-400">{e.weight_pct.toFixed(1)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="rounded-2xl border border-stone-800/80 bg-stone-900/40 p-6 shadow-xl shadow-black/20 backdrop-blur-sm card-glow">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-stone-200">분석 차트</h3>
                      <p className="mt-1 text-xs text-stone-500">종목별 투자액 비율</p>
                    </div>
                    <div className="flex items-center gap-1 rounded-lg bg-stone-800/50 p-1">
                      {[
                        { key: "donut", label: "도넛" },
                        { key: "bar", label: "막대" }
                      ].map(({ key, label }) => (
                        <button
                          key={key}
                          onClick={() => setChartType(key as "donut" | "bar")}
                          className={`rounded px-2 py-1 text-xs font-medium transition-colors ${chartType === key
                              ? "bg-amber-500/20 text-amber-400"
                              : "text-stone-400 hover:text-stone-300"
                            }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="h-[400px] flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      {chartType === "bar" ? (
                        <>
                          <BarChart data={(() => {
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
                          })()}>
                            <XAxis
                              dataKey="name"
                              tick={(props) => {
                                const filteredData = result.exposures.filter(e => e.name !== "기타(미분류)");
                                const displayData = filteredData.slice(0, 15);
                                const remainingCount = filteredData.length - 15;
                                const isLastTick = props.index === displayData.length - 1 && remainingCount > 0;

                                return (
                                  <CustomXAxisTick
                                    {...props}
                                    remainingStocks={isLastTick ? filteredData.slice(15) : undefined}
                                    onHover={(e: React.MouseEvent) => {
                                      setShowRemainingTooltip(true);
                                      setTooltipPosition({ x: e.clientX, y: e.clientY });
                                    }}
                                    onLeave={() => setShowRemainingTooltip(false)}
                                  />
                                );
                              }}
                              angle={-45}
                              textAnchor="end"
                              height={110}
                              interval={0}
                              tickMargin={5}
                            />
                            <YAxis
                              tick={{ fontSize: 10, fill: "#a8a29e" }}
                              tickFormatter={(value) => `${value.toFixed(1)}%`}
                            />
                            <Tooltip
                              cursor={false}
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
                            <Bar dataKey="weight_pct" fill="#f59e0b" />
                          </BarChart>
                        </>
                      ) : (
                        <>
                          <PieChart>
                            <Pie
                              data={(() => {
                                const filteredData = result.exposures.filter(e => e.name !== "기타(미분류)");
                                const displayData = filteredData.slice(0, 15).map(e => ({
                                  ...e,
                                  name: e.name === "기타(미분류)" ? "기타" : e.name
                                }));
                                return displayData;
                              })()}
                              dataKey="amount_usd"
                              nameKey="name"
                              cx="50%"
                              cy="50%"
                              innerRadius={50}
                              outerRadius={100}
                              paddingAngle={2}
                            >
                              {(() => {
                                const filteredData = result.exposures.filter(e => e.name !== "기타(미분류)");
                                const displayData = filteredData.slice(0, 15);
                                return displayData.map((_, i) => (
                                  <Cell
                                    key={i}
                                    fill={CHART_COLORS[i % CHART_COLORS.length]}
                                    stroke="none"
                                  />
                                ));
                              })()}
                            </Pie>
                            {chartType === "donut" && (
                              <>
                                <Pie
                                  data={[{ value: 1 }]}
                                  dataKey="value"
                                  cx="50%"
                                  cy="50%"
                                  outerRadius={50}
                                  fill="rgba(68,64,60,0.3)"
                                  stroke="none"
                                  isAnimationActive={false}
                                  legendType="none"
                                  tooltipType="none"
                                />
                                <text x="50%" y="43%" textAnchor="middle" dominantBaseline="middle" fill="#fbbf24" fontSize={16} fontWeight={600}>
                                  ${Math.round(result.total_invested_usd).toLocaleString("en-US")}
                                </text>
                                <text x="50%" y="49%" textAnchor="middle" dominantBaseline="middle" fill="#a8a29e" fontSize={11}>
                                  총 투자액
                                </text>
                              </>
                            )}
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
                            <Legend
                              wrapperStyle={{ fontSize: "12px" }}
                              formatter={(value, entry, index) => {
                                const filteredData = result.exposures.filter(e => e.name !== "기타(미분류)");
                                const isLastDisplayed = index === Math.min(15, filteredData.length) - 1;
                                const remainingCount = filteredData.length - 15;

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
                      )}
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
