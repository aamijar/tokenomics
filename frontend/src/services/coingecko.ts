import axios from 'axios';
import { COINGECKO_BASE } from '@/config';

export type Market = {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  price_change_percentage_24h: number;
  sparkline_in_7d?: { price: number[] };
};

export async function fetchMarkets(ids: string[]) {
  const { data } = await axios.get<Market[]>(`${COINGECKO_BASE}/coins/markets`, {
    params: {
      vs_currency: 'usd',
      ids: ids.join(','),
      price_change_percentage: '24h',
      sparkline: true,
    },
  });
  return data;
}
export async function marketChart(id: string, days: number = 7) {
  const { data } = await axios.get<{ prices: [number, number][] }>(`${COINGECKO_BASE}/coins/${id}/market_chart`, {
    params: { vs_currency: 'usd', days },
  });
  return data;
}

export async function tokenInfo(id: string) {
  const { data } = await axios.get(`${COINGECKO_BASE}/coins/${id}`, {
    params: { localization: false, tickers: false, community_data: false, developer_data: false, sparkline: false },
  });
  return data;
}
