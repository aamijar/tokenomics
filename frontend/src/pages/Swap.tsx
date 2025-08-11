import { useEffect, useMemo, useState } from "react";
import { getQuote, fetchTokens, Quote, prepareApprove, prepareSwap } from "@/services/backend";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type TokenMeta = { id: string; symbol: string; name: string };

export default function Swap() {
  const [tokens, setTokens] = useState<TokenMeta[]>([]);
  const [sell, setSell] = useState<TokenMeta | null>(null);
  const [buy, setBuy] = useState<TokenMeta | null>(null);
  const [amount, setAmount] = useState("");
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(false);
  const [slippageBps, setSlippageBps] = useState(50);
  const [txInfo, setTxInfo] = useState<string>("");


  useEffect(() => {
    fetchTokens().then((t) => {
      setTokens(t);
      setSell(t[0] || null);
      setBuy(t[1] || null);
    });
  }, []);

  const canQuote = useMemo(() => !!sell && !!buy && !!amount && Number(amount) > 0, [sell, buy, amount]);

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
          <div className="rounded-lg border p-3 text-sm space-y-1">
            <div className="flex justify-between">
              <span>Estimated Output</span>
              <span className="font-medium">
                {quote.toAmount} {buy?.symbol}
              </span>
            </div>
            <div className="flex justify-between">
        <div className="grid grid-cols-2 gap-3 pt-2">
          <Button
            variant="outline"
            disabled={!quote || !sell}
            onClick={async () => {
              if (!quote || !sell) return;
              const tx = await prepareApprove({
                token: "0xTokenAddress000000000000000000000000000000", // placeholder
                spender: "0xRouterSpender000000000000000000000000000000",
                amount,
                chainId: 1,
              });
              setTxInfo(`Approve tx to: ${tx.to}\nData: ${tx.data.slice(0, 42)}...`);
            }}
          >
            Prepare Approve
          </Button>
          <Button
            disabled={!quote || !sell || !buy}
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
              });
              setTxInfo(`Swap tx to: ${tx.to}\nData: ${tx.data.slice(0, 42)}...`);
            }}
          >
            Prepare Swap
          </Button>
        </div>
        {txInfo && (
          <div className="rounded-lg border p-3 text-xs whitespace-pre-wrap mt-2 bg-muted/30">{txInfo}</div>
        )}

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
          </div>
        )}
      </div>
    </div>
  );
}
