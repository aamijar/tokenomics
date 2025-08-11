import axios from "axios";
import { getCache, setCache } from "./cache.js";

const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";
const BASESCAN_API_KEY = process.env.BASESCAN_API_KEY || "";

async function fetchEtherscan(address) {
  if (!ETHERSCAN_API_KEY) return [];
  try {
    const { data } = await axios.get("https://api.etherscan.io/api", {
      params: {
        module: "account",
        action: "txlist",
        address,
        startblock: 0,
        endblock: 99999999,
        sort: "desc",
        apikey: ETHERSCAN_API_KEY,
      },
      timeout: 5000,
      validateStatus: () => true,
    });
    if (data.status !== "1") return [];
    return data.result.slice(0, 25).map((tx) => ({
      type: Number(tx.input?.length || 0) > 2 ? "tx" : "transfer",
      hash: tx.hash,
      timestamp: Number(tx.timeStamp),
      summary: `Tx ${tx.hash.slice(0, 10)}…`,
      status: tx.isError === "0" ? "success" : "failed",
      chain: "Ethereum",
    }));
  } catch {
    return [];
  }
}

async function fetchBasescan(address) {
  if (!BASESCAN_API_KEY) return [];
  try {
    const { data } = await axios.get("https://api.basescan.org/api", {
      params: {
        module: "account",
        action: "txlist",
        address,
        startblock: 0,
        endblock: 99999999,
        sort: "desc",
        apikey: BASESCAN_API_KEY,
      },
      timeout: 5000,
      validateStatus: () => true,
    });
    if (data.status !== "1") return [];
    return data.result.slice(0, 25).map((tx) => ({
      type: Number(tx.input?.length || 0) > 2 ? "tx" : "transfer",
      hash: tx.hash,
      timestamp: Number(tx.timeStamp),
      summary: `Tx ${tx.hash.slice(0, 10)}…`,
      status: tx.isError === "0" ? "success" : "failed",
      chain: "Base",
    }));
  } catch {
    return [];
  }
}

function mock(address) {
  return [
    {
      type: "swap",
      hash: "0xswap1",
      timestamp: Math.floor(Date.now() / 1000) - 3600,
      summary: "Swapped 100 RNDR for 99 GRT",
      status: "success",
      chain: "Ethereum",
    },
    {
      type: "approve",
      hash: "0xapprove1",
      timestamp: Math.floor(Date.now() / 1000) - 7200,
      summary: "Approved RNDR for trading",
      status: "success",
      chain: "Ethereum",
    },
  ];
}

export default {
  async forAddress(address) {
    const key = `activity:${address}`;
    const cached = getCache(key);
    if (cached) return cached;

    let items = [];
    try {
      const [eth, base] = await Promise.all([fetchEtherscan(address), fetchBasescan(address)]);
      items = [...eth, ...base];
    } catch {
      items = [];
    }
    if (!items.length) items = mock(address);
    return setCache(key, { address, items }, 30);
  },
};
