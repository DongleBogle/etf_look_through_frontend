export interface KsEtfItem {
  ticker: string;
  name: string;
  etfTabCode: number;
}

export async function getKsEtfs(): Promise<KsEtfItem[]> {
  const res = await fetch("/api/ks-etfs");
  if (!res.ok) throw new Error("한국 ETF 목록 조회 실패");
  const json = await res.json();
  return json.items ?? [];
}
