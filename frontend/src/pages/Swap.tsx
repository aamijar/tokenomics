import { useEffect, useMemo, useState } from "react";
import { getQuote, fetchTokens, Quote } from "@/services/backend";
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

        <Button disabled={!canQuote || loading} onClick={handleQuote} className="w-full">
          {loading ? "Getting quote..." : "Get quote"}
        </Button>

        {quote && (
          <div className="rounded-lg border p-3 text-sm space-y-1">
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
          </div>
        )}
      </div>
    </div>
  );
}
