"use client";

import { useEffect, useState } from "react";
import { getIndices, IndicesResponse, IndexData } from "@/lib/api";
import { Activity, RefreshCw } from "lucide-react";

export default function MarketPage() {
    const [data, setData] = useState<IndicesResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await getIndices();
            setData(res);
        } catch (e) {
            setError(e instanceof Error ? e.message : "지수 데이터를 불러오는데 실패했습니다.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // Refresh every minute
        const interval = setInterval(fetchData, 60000);
        return () => clearInterval(interval);
    }, []);

    const indicesList = data
        ? [
            { key: "코스피", country: "KR", flag: "🇰🇷" },
            { key: "코스닥", country: "KR", flag: "🇰🇷" },
            { key: "S&P500", country: "US", flag: "🇺🇸" },
            { key: "나스닥", country: "US", flag: "🇺🇸" },
            { key: "다우존스", country: "US", flag: "🇺🇸" },
        ]
        : [];

    const krIndices = indicesList.filter((i) => i.country === "KR");
    const usIndices = indicesList.filter((i) => i.country === "US");

    const formatNumber = (num: number, decimals: number = 2) => {
        return new Intl.NumberFormat("en-US", {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
        }).format(num);
    };

    const getMarketStatusLabel = (status: string) => {
        switch (status) {
            case "REGULAR":
                return "정규장";
            case "PRE":
                return "프리장";
            case "POST":
                return "애프터마켓";
            case "CLOSED":
                return "장마감";
            default:
                return status;
        }
    };

    const renderCard = (item: { key: string; flag: string }) => {
        const info = data?.indices.find((i) => i.name === item.key);
        if (!info) return null;

        const isPositive = info.change > 0;
        const isNegative = info.change < 0;
        const colorClass = isPositive
            ? "text-red-500" // red for up in Korea (and we'll use same for US for consistency or red/blue)
            : isNegative
                ? "text-blue-500" // blue for down
                : "text-stone-400";

        // typically in KR, red is up, blue is down.
        // typically in US, green is up, red is down.
        // For universal styling: Let's use red = UP, blue = DOWN for consistency in Korean context.

        return (
            <div
                key={item.key}
                className="rounded-2xl border border-stone-800/80 bg-stone-900/40 p-5 shadow-xl shadow-black/20 backdrop-blur-sm card-glow flex flex-col justify-between"
            >
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                        <span className="text-xl" aria-hidden="true">{item.flag}</span>
                        <h3 className="font-semibold text-stone-200">{info.name === 'S&P500' ? 'S&P 500' : info.name}</h3>
                    </div>
                    <span
                        className={`flex items-center gap-1.5 px-2 py-1 text-[10px] font-medium rounded-full ${info.market_state === "REGULAR"
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]"
                                : "bg-stone-800 text-stone-300"
                            }`}
                    >
                        {info.market_state === "REGULAR" && (
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true"></span>
                        )}
                        {getMarketStatusLabel(info.market_state)}
                    </span>
                </div>

                <div>
                    <div className="text-2xl font-bold tabular-nums text-stone-100 mb-1">
                        {formatNumber(info.current_price, info.name === '코스피' || info.name === '코스닥' ? 2 : 2)}
                    </div>
                    <div className={`flex items-center gap-2 text-sm font-medium ${colorClass}`}>
                        <span>
                            {isPositive ? "▲" : isNegative ? "▼" : ""} {formatNumber(Math.abs(info.change))}
                        </span>
                        <span>
                            ({isPositive ? "+" : ""}{formatNumber(info.change_percent)}%)
                        </span>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h1 className="flex items-center gap-3 text-2xl font-bold text-stone-100">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">
                            <Activity className="h-5 w-5 text-blue-400" />
                        </div>
                        글로벌 증시
                    </h1>
                    <p className="mt-2 text-sm text-stone-500">
                        주요 국가의 현재 시장 지수를 실시간으로 확인하세요
                    </p>
                </div>
                <button
                    onClick={fetchData}
                    disabled={loading}
                    className="flex items-center gap-2 rounded-xl bg-stone-800/50 px-4 py-2 text-sm font-medium text-stone-300 hover:bg-stone-800 hover:text-stone-100 transition-colors disabled:opacity-50"
                >
                    <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                    새로고침
                </button>
            </div>

            {error ? (
                <div className="rounded-xl border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-400">
                    {error}
                </div>
            ) : loading && !data ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-[140px] rounded-2xl border border-stone-800/80 bg-stone-900/40 p-5 animate-pulse">
                            <div className="h-6 w-24 bg-stone-800 rounded mb-6"></div>
                            <div className="h-8 w-32 bg-stone-800 rounded mb-2"></div>
                            <div className="h-4 w-20 bg-stone-800 rounded"></div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="space-y-8">
                    {/* Korea Markets */}
                    <div>
                        <h2 className="text-lg font-semibold text-stone-300 mb-4 flex items-center gap-2">
                            <span>🇰🇷</span> 한국 증시
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {krIndices.map(renderCard)}
                        </div>
                    </div>

                    {/* US Markets */}
                    <div>
                        <h2 className="text-lg font-semibold text-stone-300 mb-4 flex items-center gap-2">
                            <span>🇺🇸</span> 미국 증시
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {usIndices.map(renderCard)}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
