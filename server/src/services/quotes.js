import { getCache, setCache } from "./cache.js";

const PROVIDER = (process.env.QUOTE_PROVIDER || "mock").toLowerCase();

async function oneInchQuote(params) {
  const { quote } = await import("../providers/oneinch.js");
  return quote(params);
}

function mockQuote({ fromToken, toToken, amount }) {
  const amt = Number(amount || "0");
  const rate = 0.99;
  const toAmount = amt * rate;
  return {
    provider: "mock",
    fromToken,
    toToken,
    amount,
    toAmount: toAmount.toString(),
    priceImpactBps: 25,
    estimatedGasUSD: 2.1,
    route: [{ protocol: "MOCK", portion: 1 }],
    notice: "Mock quote for development. Set QUOTE_PROVIDER to uniswapx or 1inch for live.",
  };
}

export default {
  async get(params) {
    const key = `quote:${PROVIDER}:${params.chainId}:${params.fromToken}:${params.toToken}:${params.amount}`;
    const cached = getCache(key);
    if (cached) return cached;

    let res;
    try {
      if (PROVIDER === "1inch") {
        res = await oneInchQuote(params);
      } else {
        res = mockQuote(params);
      }
    } catch (e) {
      res = { ...mockQuote(params), notice: `Provider failed, using mock: ${String(e?.message || e)}` };
    }
    return setCache(key, res, 15);
  },
};
