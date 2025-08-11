import { Router } from "express";
import { z } from "zod";
import prices from "../services/prices.js";
import tokens from "../services/tokens.js";
import quotes from "../services/quotes.js";
import activity from "../services/activity.js";
import pools from "../services/pools.js";
import tx from "../services/tx.js";
import addresses from "../services/addresses.js";

export const router = Router();

router.get("/tokens", async (_req, res) => {
  const list = await tokens.list();
  res.json(list);
});

router.get("/prices", async (req, res) => {
  try {
    const ids = (req.query.ids || "").toString().split(",").filter(Boolean);
    const data = await prices.markets(ids);
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e?.message || "failed to fetch prices" });
  }
});

router.get("/addresses", async (req, res) => {
  const ids = (req.query.ids || "").toString().split(",").filter(Boolean);
  const data = await addresses.forIds(ids);
  res.json({ items: data });
});

const quoteSchema = z.object({
  fromToken: z.string().min(1),
  toToken: z.string().min(1),
  amount: z.string().regex(/^\d+(\.\d+)?$/),
  chainId: z.coerce.number().default(1),
});
router.get("/quotes", async (req, res) => {
  const parsed = quoteSchema.safeParse({
    fromToken: req.query.fromToken,
    toToken: req.query.toToken,
    amount: req.query.amount,
    chainId: req.query.chainId,
  });
  if (!parsed.success) {
    return res.status(400).json({ error: "invalid parameters", issues: parsed.error.issues });
  }
  const data = await quotes.get(parsed.data);
  res.json(data);
});

const approveSchema = z.object({
  token: z.string().min(1),
  spender: z.string().min(1),
  amount: z.string().regex(/^\d+(\.\d+)?$/),
  chainId: z.coerce.number().default(1),
  from: z.string().min(1),
});
router.post("/approve", async (req, res) => {
  const parsed = approveSchema.safeParse(req.body || {});
  if (!parsed.success) {
    return res.status(400).json({ error: "invalid parameters", issues: parsed.error.issues });
  }
  const data = await tx.prepareApproval(parsed.data);
  res.json(data);
});

const swapSchema = z.object({
  fromToken: z.string().min(1),
  toToken: z.string().min(1),
  amount: z.string().regex(/^\d+(\.\d+)?$/),
  minAmountOut: z.string().regex(/^\d+(\.\d+)?$/).optional().default("0"),
  chainId: z.coerce.number().default(1),
  from: z.string().min(1),
  slippageBps: z.coerce.number().min(1).max(5000).default(50),
});
router.post("/swap", async (req, res) => {
  const parsed = swapSchema.safeParse(req.body || {});
  if (!parsed.success) {
    return res.status(400).json({ error: "invalid parameters", issues: parsed.error.issues });
  }
  const data = await tx.prepareSwap(parsed.data);
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
