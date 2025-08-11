import axios from "axios";

const ONEINCH_BASE = process.env.ONEINCH_BASE || "https://api.1inch.dev";
const ONEINCH_API_KEY = process.env.ONEINCH_API_KEY || "";

function authHeaders() {
  if (!ONEINCH_API_KEY) throw new Error("ONEINCH_API_KEY not set");
  return { Authorization: `Bearer ${ONEINCH_API_KEY}` };
}

export async function quote({ chainId, fromToken, toToken, amount }) {
  const url = `${ONEINCH_BASE}/swap/v6.0/${chainId}/quote`;
  const { data } = await axios.get(url, {
    headers: authHeaders(),
    params: {
      src: fromToken,
      dst: toToken,
      amount,
    },
    timeout: 5000,
    validateStatus: () => true,
  });
  return {
    provider: "1inch",
    fromToken,
    toToken,
    amount: String(amount),
    toAmount: String(data.dstAmount || data.toAmount || "0"),
    priceImpactBps: Number(Math.round((data.priceImpact || 0) * 100)),
    estimatedGasUSD: 0,
    route: [{ protocol: "1inch", portion: 1 }],
  };
}

export async function buildApproveTx({ chainId, token, spender, amount }) {
  const url = `${ONEINCH_BASE}/approve/v1.2/${chainId}/transaction`;
  const { data } = await axios.get(url, {
    headers: authHeaders(),
    params: { tokenAddress: token, amount },
    timeout: 5000,
    validateStatus: () => true,
  });
  const to = spender || data.to;
  return {
    provider: "1inch",
    type: "approve",
    chainId,
    to,
    data: data.data,
    value: data.value || "0x0",
  };
}

export async function buildSwapTx({ chainId, fromAddress, fromToken, toToken, amount, slippageBps }) {
  const url = `${ONEINCH_BASE}/swap/v6.0/${chainId}/swap`;
  const slippage = (slippageBps ?? 50) / 100; // v6 expects percent
  const { data } = await axios.get(url, {
    headers: authHeaders(),
    params: {
      src: fromToken,
      dst: toToken,
      amount,
      from: fromAddress,
      slippage,
      allowPartialFill: false,
    },
    timeout: 5000,
    validateStatus: () => true,
  });
  const tx = data.tx || data.transaction || data;
  return {
    provider: "1inch",
    type: "swap",
    chainId,
    from: fromAddress,
    to: tx.to,
    data: tx.data,
    value: tx.value || "0x0",
    route: [{ protocol: "1inch", portion: 1 }],
    slippageBps,
  };
}
