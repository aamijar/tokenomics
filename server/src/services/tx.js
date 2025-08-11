const PROVIDER = (process.env.QUOTE_PROVIDER || "mock").toLowerCase();

export default {
  async prepareApproval({ token, spender, amount, chainId, from }) {
    if (PROVIDER === "1inch") {
      try {
        const { buildApproveTx } = await import("../providers/oneinch.js");
        const tx = await buildApproveTx({
          chainId: Number(chainId || 1),
          token,
          spender,
          amount,
        });
        return tx;
      } catch (e) {
      }
    }
    return {
      provider: PROVIDER || "mock",
      type: "approve",
      chainId: Number(chainId || 1),
      from,
      to: token,
      data:
        "0x095ea7b3000000000000000000000000" +
        (spender || "").replace(/^0x/, "").padStart(40, "0") +
        (BigInt(amount || "0") % (1n << 256n)).toString(16).padStart(64, "0"),
      value: "0x0",
      notice: "Mock approval data. Set QUOTE_PROVIDER=1inch and ONEINCH_API_KEY for live routing.",
    };
  },
  async prepareSwap({ fromToken, toToken, amount, minAmountOut, chainId, from, slippageBps }) {
    if (PROVIDER === "1inch") {
      try {
        const { buildSwapTx } = await import("../providers/oneinch.js");
        const tx = await buildSwapTx({
          chainId: Number(chainId || 1),
          fromAddress: from,
          fromToken,
          toToken,
          amount,
          slippageBps: Number(slippageBps || 50),
          minAmountOut,
        });
        return tx;
      } catch (e) {
      }
    }
    return {
      provider: PROVIDER || "mock",
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
