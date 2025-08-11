export default {
  async prepareApproval({ token, spender, amount, chainId, from }) {
    return {
      provider: process.env.QUOTE_PROVIDER?.toLowerCase() || "mock",
      type: "approve",
      chainId: Number(chainId || 1),
      from,
      to: token,
      data: "0x095ea7b3000000000000000000000000" + (spender || "").replace(/^0x/, "").padStart(40, "0") + (BigInt(amount || "0") % (1n << 256n)).toString(16).padStart(64, "0"),
      value: "0x0",
      notice: "Mock approval data. Set QUOTE_PROVIDER to uniswapx or 1inch for live routing.",
    };
  },
  async prepareSwap({ fromToken, toToken, amount, minAmountOut, chainId, from, slippageBps }) {
    return {
      provider: process.env.QUOTE_PROVIDER?.toLowerCase() || "mock",
      type: "swap",
      chainId: Number(chainId || 1),
      from,
      to: "0xrouter000000000000000000000000000000000000", 
      data: "0x" + "deadbeef".padEnd(64, "0"),
      value: "0x0",
      route: [{ protocol: "MOCK", portion: 1 }],
      slippageBps: Number(slippageBps || 50),
      params: { fromToken, toToken, amount, minAmountOut },
      notice: "Mock swap tx. Configure provider/keys for live execution.",
    };
  },
};
