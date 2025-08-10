import axios from "axios";

const BACKEND_BASE = import.meta.env.VITE_BACKEND_BASE || "";

export const api = axios.create({
  baseURL: BACKEND_BASE,
  timeout: 15000,
});

export async function fetchTokens() {
  const { data } = await api.get("/api/tokens");
  return data as { id: string; symbol: string; name: string }[];
}

export async function fetchBackendMarkets(ids: string[]) {
  const { data } = await api.get("/api/prices", { params: { ids: ids.join(",") } });
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
