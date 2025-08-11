const PROVIDER = (process.env.QUOTE_PROVIDER || "mock").toLowerCase();

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
    if (PROVIDER === "mock") return mockQuote(params);
    return mockQuote(params);
  },
};
