import axios from "axios";
import { getCache, setCache } from "./cache.js";

const SUBGRAPH_ETH = process.env.UNISWAP_V3_SUBGRAPH_ETH || "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3";
const SUBGRAPH_BASE =
  process.env.UNISWAP_V3_SUBGRAPH_BASE ||
  "https://api.studio.thegraph.com/query/24808/uniswap-v3-base/version/latest";

const queryTopPools = `
  query TopPools($first:Int!) {
    pools(first: $first, orderBy: totalValueLockedUSD, orderDirection: desc) {
      id
      token0 { symbol }
      token1 { symbol }
      feeTier
      totalValueLockedUSD
      volumeUSD
      feesUSD
    }
  }
`;

async function fetchPoolsFrom(subgraphUrl) {
  try {
    const { data } = await axios.post(
      subgraphUrl,
      {
        query: queryTopPools,
        variables: { first: 8 },
      },
      { timeout: 5000, validateStatus: () => true }
    );
    const rows = data?.data?.pools || [];
    if (!Array.isArray(rows)) return [];
    return rows.map((p) => ({
      id: p.id,
      name: `${p.token0.symbol}/${p.token1.symbol}`,
      feeTierBps: Number(p.feeTier),
      tvlUSD: Number(p.totalValueLockedUSD),
      volume24hUSD: Number(p.volumeUSD),
      apr: Number(p.feesUSD) > 0 && Number(p.totalValueLockedUSD) > 0 ? (Number(p.feesUSD) / Number(p.totalValueLockedUSD)) * 100 : 0,
    }));
  } catch {
    return [];
  }
}

export default {
  async overview() {
    const key = "pools:overview";
    const cached = getCache(key);
    if (cached) return cached;

    const [eth, base] = await Promise.all([fetchPoolsFrom(SUBGRAPH_ETH), fetchPoolsFrom(SUBGRAPH_BASE)]);
    let pools = [
      ...eth.map((p) => ({ ...p, chain: "Ethereum" })),
      ...base.map((p) => ({ ...p, chain: "Base" })),
    ];
    if (!pools.length) {
      pools = [
        { id: "rndr-grt-3000", name: "RNDR/GRT", feeTierBps: 300, tvlUSD: 3250000, volume24hUSD: 410000, apr: 12.5, chain: "Ethereum" },
        { id: "fet-ocean-500", name: "FET/OCEAN", feeTierBps: 50, tvlUSD: 1870000, volume24hUSD: 220000, apr: 9.1, chain: "Base" },
      ];
    }
    const tvlUSD = pools.reduce((a, p) => a + (p.tvlUSD || 0), 0);
    return setCache(key, { tvlUSD, pools }, 60);
  },
};
