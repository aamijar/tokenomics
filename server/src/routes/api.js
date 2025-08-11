import { Router } from "express";
import prices from "../services/prices.js";
import tokens from "../services/tokens.js";
import quotes from "../services/quotes.js";
import activity from "../services/activity.js";
import pools from "../services/pools.js";
import tx from "../services/tx.js";

export const router = Router();

router.get("/tokens", async (_req, res) => {
  const list = await tokens.list();
  res.json(list);
});

router.get("/prices", async (req, res) => {
  const ids = (req.query.ids || "").toString().split(",").filter(Boolean);
  const data = await prices.markets(ids);
  res.json(data);
});

router.get("/quotes", async (req, res) => {
  const { fromToken, toToken, amount, chainId } = req.query;
  const data = await quotes.get({
    fromToken: String(fromToken || ""),
    toToken: String(toToken || ""),
    amount: String(amount || ""),
    chainId: Number(chainId || 1),
  });
  res.json(data);
});

router.post("/approve", async (req, res) => {
  const { token, spender, amount, chainId, from } = req.body || {};
  const data = await tx.prepareApproval({
    token: String(token || ""),
    spender: String(spender || ""),
    amount: String(amount || ""),
    chainId: Number(chainId || 1),
    from: String(from || ""),
  });
  res.json(data);
});

router.post("/swap", async (req, res) => {
  const { fromToken, toToken, amount, minAmountOut, chainId, from, slippageBps } = req.body || {};
  const data = await tx.prepareSwap({
    fromToken: String(fromToken || ""),
    toToken: String(toToken || ""),
    amount: String(amount || ""),
    minAmountOut: String(minAmountOut || ""),
    chainId: Number(chainId || 1),
    from: String(from || ""),
    slippageBps: Number(slippageBps || 50),
  });
  res.json(data);
});

router.get("/activity/:address", async (req, res) => {
  const { address } = req.params;
  const data = await activity.forAddress(address);
  res.json(data);
});

router.get("/pools", async (_req, res) => {
  const data = await pools.overview();
  res.json(data);
});
