"use client";

import { useEffect, useState } from "react";
import { getIndices, IndicesResponse, IndexData } from "@/lib/api";
import { Activity, Clock } from "lucide-react";

const MARKET_STATUS: Record<string, string> = {
    REGULAR: "정규장",
    PRE: "프리마켓",
    POST: "애프터마켓",
    POSTPOST: "장마감",
    CLOSED: "휴장일",
    PREPRE: "장마감",
};

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

    const renderCard = (item: { key: string; flag: string }) => {
        const info = data?.indices.find((i) => i.name === item.key);
        if (!info) return null;

        const isPositive = info.change > 0;
        const isNegative = info.change < 0;
        const colorClass = isPositive
            ? "text-[#f04452]"
            : isNegative
                ? "text-toss-blue"
                : "text-toss-gray-500";

        return (
            <div
                key={item.key}
                className="card-toss p-5 flex flex-col justify-between"
            >
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                        <span className="text-xl" aria-hidden="true">{item.flag}</span>
                        <h3 className="font-semibold text-toss-gray-900">{info.name === 'S&P500' ? 'S&P 500' : info.name}</h3>
                    </div>
                    <span
                        className={`flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-semibold rounded-full ${info.market_state === "REGULAR"
                                ? "bg-emerald-50 text-emerald-600"
                                : "bg-toss-gray-100 text-toss-gray-600"
                            }`}
                    >
                        {info.market_state === "REGULAR" && (
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true"></span>
                        )}
                        {MARKET_STATUS[info.market_state] || info.market_state}
                    </span>
                </div>

                <div>
                    <div className="text-2xl font-bold tabular-nums text-toss-gray-900 mb-1">
                        {formatNumber(info.current_price, 2)}
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
                    <h1 className="flex items-center gap-3 text-2xl font-bold text-toss-gray-900">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-toss-blue-light">
                            <Activity className="h-5 w-5 text-toss-blue" />
                        </div>
                        글로벌 증시
                    </h1>
                    <p className="mt-2 text-sm text-toss-gray-500">
                        주요 국가의 현재 시장 지수를 실시간으로 확인하세요
                    </p>
                </div>
                {(data?.cached_at ?? data?.indices?.[0]?.cached_at) && (
                    <div className="flex items-center gap-2 text-sm text-toss-gray-500">
                        <Clock className="h-4 w-4" />
                        <span>업데이트: {data?.cached_at ?? data?.indices?.[0]?.cached_at}</span>
                    </div>
                )}
            </div>

            {error ? (
                <div className="rounded-2xl bg-red-50 px-5 py-4 text-sm text-[#f04452] font-medium">
                    {error}
                </div>
            ) : loading && !data ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-[140px] card-toss p-5 animate-pulse">
                            <div className="h-6 w-24 bg-toss-gray-200 rounded-lg mb-6"></div>
                            <div className="h-8 w-32 bg-toss-gray-200 rounded-lg mb-2"></div>
                            <div className="h-4 w-20 bg-toss-gray-200 rounded-lg"></div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="space-y-8">
                    <div>
                        <h2 className="text-base font-semibold text-toss-gray-800 mb-4 flex items-center gap-2">
                            <span>🇰🇷</span> 한국 증시
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {krIndices.map(renderCard)}
                        </div>
                    </div>

                    <div>
                        <h2 className="text-base font-semibold text-toss-gray-800 mb-4 flex items-center gap-2">
                            <span>🇺🇸</span> 미국 증시
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {usIndices.map(renderCard)}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
