import axios from "axios";
import { getCache, setCache } from "./cache.js";

const COINGECKO_BASE = process.env.COINGECKO_BASE || "https://api.coingecko.com/api/v3";

async function fetchCoinPlatforms(id) {
  const key = `platforms:${id}`;
  const cached = getCache(key);
  if (cached) return cached;

  const { data } = await axios.get(`${COINGECKO_BASE}/coins/${id}`, {
    params: {
      localization: false,
      tickers: false,
      market_data: false,
      community_data: false,
      developer_data: false,
      sparkline: false,
    },
  });

  const platforms = data?.platforms || {};
  const out = {
    id,
    addresses: {
      ethereum: platforms.ethereum || "",
      base: platforms.base || "",
      polygon: platforms.polygon_pos || platforms.polygon || "",
      arbitrum: platforms.arbitrum_one || "",
      bsc: platforms.binance_smart_chain || "",
      optimism: platforms.optimistic_ethereum || platforms.optimism || "",
    },
  };
  return setCache(key, out, 3600);
}

export default {
  async forIds(ids = []) {
    const results = await Promise.all(ids.map((id) => fetchCoinPlatforms(id).catch(() => ({ id, addresses: {} }))));
    return results;
  },
};
