import { useEffect, useMemo, useState } from 'react';
import { fetchBackendMarkets as fetchMarkets } from '@/services/backend';
import { useAccount } from 'wagmi';
import { useBalances } from '@/hooks/useBalances';
type Market = {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  price_change_percentage_24h: number;
  sparkline_in_7d?: { price: number[] };
};
import { usePortfolio } from '@/store/portfolio';
import { formatCurrency } from '@/lib/format';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export default function Portfolio() {
  const { address, isConnected } = useAccount();
  const { holdings } = usePortfolio();
  const [markets, setMarkets] = useState<Record<string, Market>>({});

  const ids = useMemo(() => holdings.map((h) => h.id), [holdings]);
  const { balances, loading: balLoading, error: balError } = useBalances(ids);

  useEffect(() => {
    if (!ids.length) return;
    fetchMarkets(ids).then((rows: Market[]) => {
      const map: Record<string, Market> = {};
      rows.forEach((r: Market) => (map[r.id] = r));
      setMarkets(map);
    });
  }, [ids]);

  const rows = useMemo(() => {
    if (!isConnected) return holdings.map((h) => ({ id: h.id, name: h.name, symbol: h.symbol, amount: h.amount }));
    return ids.map((id) => ({
      id,
      name: holdings.find((h) => h.id === id)?.name || id,
      symbol: holdings.find((h) => h.id === id)?.symbol || id.toUpperCase(),
      amount: balances[id]?.amount || 0,
    }));
  }, [isConnected, holdings, ids, balances]);

  const total = rows.reduce((acc, r) => acc + (markets[r.id]?.current_price || 0) * r.amount, 0);

  const history = Array.from({ length: 30 }).map((_, i) => ({
    day: i + 1,
    value: total * (0.9 + Math.random() * 0.2),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-xl font-semibold">Portfolio</h2>
          <div className="text-muted-foreground text-sm">
            {isConnected ? (
              <>Connected: {address?.slice(0, 6)}…{address?.slice(-4)} {balLoading ? '— loading balances…' : balError ? `— ${balError}` : ''}</>
            ) : (
              <>Mock portfolio. Connect wallet to replace with on-chain balances.</>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-muted-foreground">Total value</div>
          <div className="text-3xl font-semibold tabular-nums">{formatCurrency(total)}</div>
        </div>
      </div>

      <div className="rounded-lg border p-4">
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={history}>
              <XAxis dataKey="day" hide />
              <YAxis hide />
              <Tooltip formatter={(v: number) => formatCurrency(v)} />
              <Area type="monotone" dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="px-4 py-2 text-left">Token</th>
              <th className="px-4 py-2 text-right">Amount</th>
              <th className="px-4 py-2 text-right">Price</th>
              <th className="px-4 py-2 text-right">Value</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const m = markets[r.id];
              const value = (m?.current_price || 0) * r.amount;
              return (
                <tr key={r.id} className="border-t hover:bg-muted/40">
                  <td className="px-4 py-3">
                    <div className="font-medium">{r.name}</div>
                    <div className="text-xs text-muted-foreground">{r.symbol}</div>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">{r.amount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{formatCurrency(m?.current_price)}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{formatCurrency(value)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
