import axios from "axios";
import { getCache, setCache } from "./cache.js";

const COINGECKO_BASE = process.env.COINGECKO_BASE || "https://api.coingecko.com/api/v3";

export default {
  async markets(ids) {
    const key = `markets:${ids.join(",")}`;
    const cached = getCache(key);
    try {
      const { data } = await axios.get(`${COINGECKO_BASE}/coins/markets`, {
        params: {
          vs_currency: "usd",
          ids: ids.join(","),
          price_change_percentage: "24h",
          sparkline: true,
        },
        timeout: 5000,
        validateStatus: () => true,
      });
      if (Array.isArray(data)) {
        return setCache(key, data, 30);
      }
      if (cached) return cached;
      return [];
    } catch (_e) {
      if (cached) return cached;
      return [];
    }
  },
};
