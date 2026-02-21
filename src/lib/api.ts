const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface ExchangeRateResponse {
  rate: number;
  unit: string;
}

export interface StockExposure {
  name: string;
  amount_usd: number;
  amount_krw: number;
  weight_pct: number;
}

export interface PortfolioAnalyzeResponse {
  total_invested_usd: number;
  total_invested_krw: number;
  exchange_rate: number;
  exposures: StockExposure[];
}

export interface HoldingItem {
  ticker: string;
  name: string;
  weight_pct: number;
}

export interface ETFDetailResponse {
  ticker: string;
  long_name: string | null;
  current_price: number;
  fund_family: string | null;
  total_assets: number | null;
  holdings: HoldingItem[];
  summary: string | null;
}

export async function getExchangeRate(): Promise<ExchangeRateResponse> {
  const res = await fetch(`${API_BASE}/api/exchange-rate`);
  if (!res.ok) throw new Error("환율 조회 실패");
  return res.json();
}

export async function analyzePortfolio(body: {
  us_tickers: string[];
  ks_tickers: string[];
  kq_tickers: string[];
  quantities: Record<string, number>;
}): Promise<PortfolioAnalyzeResponse> {
  const res = await fetch(`${API_BASE}/api/portfolio/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "포트폴리오 분석 실패");
  }
  return res.json();
}

export async function getETFDetail(ticker: string): Promise<ETFDetailResponse> {
  const res = await fetch(`${API_BASE}/api/etf/${encodeURIComponent(ticker)}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "ETF 상세 조회 실패");
  }
  return res.json();
}

export interface IndexData {
  name: string;
  ticker: string;
  current_price: number;
  change: number;
  change_percent: number;
  market_state: "REGULAR" | "PRE" | "POST" | "CLOSED" | "PREPRE" | "POSTPOST" | string;
  cached_at?: string;
}

export interface IndicesResponse {
  indices: IndexData[];
  cached_at?: string;
}

export async function getIndices(): Promise<IndicesResponse> {
  const res = await fetch(`${API_BASE}/api/indices`);
  if (!res.ok) throw new Error("지수 조회 실패");
  return res.json();
}
