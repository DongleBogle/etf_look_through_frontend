import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import iconv from "iconv-lite";

export interface KsEtfItem {
  ticker: string;
  name: string;
  etfTabCode: number;
}

async function fetchKsEtfsFromNaver(): Promise<KsEtfItem[]> {
  const res = await fetch("https://finance.naver.com/api/sise/etfItemList.nhn", {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; ETFLookThrough/1.0)" },
    next: { revalidate: 86400 },
  });
  if (!res.ok) throw new Error("ETF 목록 조회 실패");
  const buf = Buffer.from(await res.arrayBuffer());
  const text = iconv.decode(buf, "euc-kr");
  const json = JSON.parse(text);
  const list = json?.result?.etfItemList ?? [];
  return list
    .filter((item: { etfTabCode?: number }) =>
      [1, 4].includes(Number(item.etfTabCode))
    )
    .map((item: { itemcode?: string; itemname?: string; etfTabCode?: number }) => ({
      ticker: String(item.itemcode ?? ""),
      name: String(item.itemname ?? ""),
      etfTabCode: Number(item.etfTabCode ?? 0),
    }))
    .filter((item: KsEtfItem) => item.ticker && item.name);
}

const getCachedKsEtfs = unstable_cache(
  fetchKsEtfsFromNaver,
  ["ks-etf-list"],
  { revalidate: 86400 }
);

export async function GET() {
  try {
    const items = await getCachedKsEtfs();
    return NextResponse.json({ items });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "조회 실패" },
      { status: 500 }
    );
  }
}
