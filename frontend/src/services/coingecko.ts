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
