import axios from "axios";

const BACKEND_BASE = import.meta.env.VITE_BACKEND_BASE || "";

export const api = axios.create({
  baseURL: BACKEND_BASE,
  timeout: 15000,
});

export type TokenSummary = { id: string; symbol: string; name: string };

export async function fetchTokens() {
  const { data } = await api.get("/api/tokens");
  return data as TokenSummary[];
}

export async function fetchBackendMarkets(ids: string[]) {
  const { data } = await api.get("/api/prices", { params: { ids: ids.join(",") } });
  return data;
}
export type TokenAddressesResponse = {
  items: { id: string; addresses: Record<string, string> }[];
};

export async function fetchTokenAddresses(ids: string[]) {
  const { data } = await api.get<TokenAddressesResponse>("/api/addresses", { params: { ids: ids.join(",") } });
  return data;
}


export type Quote = {
  provider: string;
  fromToken: string;
  toToken: string;
  amount: string;
  toAmount: string;
  priceImpactBps: number;
  estimatedGasUSD: number;
  route: { protocol: string; portion: number }[];
  notice?: string;
};

export async function getQuote(params: { fromToken: string; toToken: string; amount: string; chainId: number }) {
  const { data } = await api.get<Quote>("/api/quotes", { params });
  return data;
}
export type PreparedTx = {
  provider: string;
  type: "approve" | "swap";
  chainId: number;
  from?: string;
  to: string;
  data: string;
  value: string;
  route?: { protocol: string; portion: number }[];
  slippageBps?: number;
  params?: Record<string, string | number>;
  notice?: string;
};

export async function prepareApprove(body: {
  token: string;
  spender: string;
  amount: string;
  chainId: number;
  from?: string;
}) {
  const { data } = await api.post<PreparedTx>("/api/approve", body);
  return data;
}

export async function prepareSwap(body: {
  fromToken: string;
  toToken: string;
  amount: string;
  minAmountOut: string;
  chainId: number;
  from?: string;
  slippageBps?: number;
}) {
  const { data } = await api.post<PreparedTx>("/api/swap", body);
  return data;
}


export type PoolOverview = {
  tvlUSD: number;
  pools: {
    id: string;
    name: string;
    feeTierBps: number;
    tvlUSD: number;
    volume24hUSD: number;
    apr: number;
    chain: string;
  }[];
};

export async function fetchPools() {
  const { data } = await api.get<PoolOverview>("/api/pools");
  return data;
}

export type ActivityItem = {
  type: string;
  hash: string;
  timestamp: number;
  summary: string;
  status: "pending" | "success" | "failed";
  chain: string;
};

export type ActivityResponse = {
  address: string;
  items: ActivityItem[];
};

export async function fetchActivity(address: string) {
  const { data } = await api.get<ActivityResponse>(`/api/activity/${address}`);
  return data;
}
