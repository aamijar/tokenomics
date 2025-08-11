import { useEffect, useMemo, useState } from "react";
import { getQuote, fetchTokens, Quote, prepareApprove, prepareSwap, resolvePrimaryAddresses } from "@/services/backend";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAccount, usePublicClient } from "wagmi";
import { Address, parseUnits } from "viem";
import { ERC20_ABI } from "@/abi/erc20";
import { useAllowance } from "@/hooks/useAllowance";

type TokenMeta = { id: string; symbol: string; name: string };

export default function Swap() {
  const [tokens, setTokens] = useState<TokenMeta[]>([]);
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();

  const [sell, setSell] = useState<TokenMeta | null>(null);
  const [buy, setBuy] = useState<TokenMeta | null>(null);
  const [amount, setAmount] = useState("");
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(false);
  const [slippageBps, setSlippageBps] = useState(50);
  const [txInfo, setTxInfo] = useState<string>("");

  const [sellTokenAddr, setSellTokenAddr] = useState<Address | null>(null);
  const [sellDecimals, setSellDecimals] = useState<number>(18);
  const [spender, setSpender] = useState<Address | null>(null);

  useEffect(() => {
    fetchTokens().then((t) => {
      setTokens(t);
      setSell(t[0] || null);
      setBuy(t[1] || null);
    });
  }, []);

  useEffect(() => {
    async function resolveAddresses() {
      if (!sell && !buy) return;
      const ids = [sell?.id, buy?.id].filter(Boolean) as string[];
      if (!ids.length) return;
      const list: { id: string; address: string }[] = await resolvePrimaryAddresses(ids);
      const s = list.find((x) => x.id === sell?.id)?.address as Address | undefined;
      setSellTokenAddr(s || null);
    }
    resolveAddresses();
  }, [sell, buy]);

  useEffect(() => {
    async function loadDecimals() {
      if (!publicClient || !sellTokenAddr) {
        setSellDecimals(18);
        return;
      }
      try {
        const d = await publicClient.readContract({
          address: sellTokenAddr,
          abi: ERC20_ABI,
          functionName: "decimals",
          args: [],
        });
        setSellDecimals(Number(d || 18));
      } catch {
        setSellDecimals(18);
      }
    }
    loadDecimals();
  }, [publicClient, sellTokenAddr]);

  const canQuote = useMemo(() => !!sell && !!buy && !!amount && Number(amount) > 0, [sell, buy, amount]);

  const rawAmount = useMemo(() => {
    const n = Number(amount || "0");
    try {
      return n > 0 ? parseUnits(String(n), sellDecimals) : 0n;
    } catch {
      return 0n;
    }
  }, [amount, sellDecimals]);

  const { allowance } = useAllowance(sellTokenAddr, spender);
  const needsApprove = useMemo(() => allowance < rawAmount, [allowance, rawAmount]);

  const handleQuote = async () => {
    if (!canQuote || !sell || !buy) return;
    setLoading(true);
    try {
      const q = await getQuote({
        fromToken: sell.id,
        toToken: buy.id,
        amount,
        chainId: 1,
      });
      setQuote(q);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!canQuote) return;
    const id = setInterval(() => {
      handleQuote();
    }, 10000);
    return () => clearInterval(id);
  }, [canQuote, sell, buy, amount, slippageBps]);

  return (
    <div className="grid gap-4 max-w-xl">
      <h2 className="text-xl font-semibold">Swap</h2>

      <div className="rounded-xl border p-4 space-y-4 bg-card">
        <div className="grid grid-cols-3 gap-3 items-center">
          <div className="text-sm text-muted-foreground">Sell</div>
          <Input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.0" className="col-span-2" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-xs text-muted-foreground mb-1">From</div>
            <Select value={sell?.id} onValueChange={(v) => setSell(tokens.find((t) => t.id === v) || null)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {tokens.map((t) => (
                  <SelectItem key={t.id} value={t.id}>{`${t.symbol} • ${t.name}`}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">To</div>
            <Select value={buy?.id} onValueChange={(v) => setBuy(tokens.find((t) => t.id === v) || null)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {tokens
                  .filter((t) => t.id !== sell?.id)
                  .map((t) => (
                    <SelectItem key={t.id} value={t.id}>{`${t.symbol} • ${t.name}`}</SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="text-xs text-muted-foreground">Slippage (bps)</div>
            <Input
              value={slippageBps}
              onChange={(e) => setSlippageBps(Math.max(1, Math.min(1000, Number(e.target.value) || 0)))}
              className="w-24"
              type="number"
              min={1}
              max={1000}
            />
          </div>
          <Button disabled={!canQuote || loading} onClick={handleQuote} className="ml-auto">
            {loading ? "Getting quote..." : "Get quote"}
          </Button>
        </div>

        {quote && (
          <div className="rounded-lg border p-3 text-sm space-y-2">
            <div className="flex justify-between">
              <span>Estimated Output</span>
              <span className="font-medium">
                {quote.toAmount} {buy?.symbol}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Provider</span>
              <span>{quote.provider}</span>
            </div>
            <div className="flex justify-between">
              <span>Price Impact</span>
              <span>{(quote.priceImpactBps / 100).toFixed(2)}%</span>
            </div>
            <div className="flex justify-between">
              <span>Estimated Fees</span>
              <span>${quote.estimatedGasUSD.toFixed(2)}</span>
            </div>
            {quote.notice && <div className="text-xs text-muted-foreground">{quote.notice}</div>}

            <div className="grid grid-cols-2 gap-3 pt-2">
              <Button
                variant={needsApprove ? "default" : "outline"}
                disabled={!quote || !sellTokenAddr || !isConnected || !address || !!(!needsApprove)}
                onClick={async () => {
                  if (!quote || !sell || !sellTokenAddr) return;
                  const tx = await prepareApprove({
                    token: sellTokenAddr,
                    spender: (spender as string) || "0x0000000000000000000000000000000000000000",
                    amount,
                    chainId: 1,
                    from: isConnected && address ? address : "0x0000000000000000000000000000000000000000",
                  });
                  if (!spender && tx?.to) setSpender(tx.to as Address);
                  setTxInfo(`Approve tx to: ${tx.to}\nData: ${tx.data.slice(0, 42)}...`);
                }}
              >
                {needsApprove ? "Prepare Approve" : "Approved"}
              </Button>
              <Button
                disabled={!quote || !sell || !buy || needsApprove || !isConnected || !address}
                onClick={async () => {
                  if (!quote || !sell || !buy) return;
                  const minOut = (Number(quote.toAmount) * (1 - slippageBps / 10000)).toString();
                  const tx = await prepareSwap({
                    fromToken: sell.id,
                    toToken: buy.id,
                    amount,
                    minAmountOut: minOut,
                    chainId: 1,
                    slippageBps,
                    from: isConnected && address ? address : "0x0000000000000000000000000000000000000000",
                  });
                  if (!spender && tx?.to) setSpender(tx.to as Address);
                  setTxInfo(`Swap tx to: ${tx.to}\nData: ${tx.data.slice(0, 42)}...`);
                }}
              >
                Prepare Swap
              </Button>
            </div>
            {txInfo && <div className="rounded-lg border p-3 text-xs whitespace-pre-wrap mt-2 bg-muted/30">{txInfo}</div>}
          </div>
        )}
      </div>
    </div>
  );
}
