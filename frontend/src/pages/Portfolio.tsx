import { useEffect, useMemo, useState } from 'react';
import { fetchMarkets, Market } from '@/services/coingecko';
import { usePortfolio } from '@/store/portfolio';
import { formatCurrency } from '@/lib/format';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export default function Portfolio() {
  const { holdings } = usePortfolio();
  const [markets, setMarkets] = useState<Record<string, Market>>({});

  const ids = useMemo(() => holdings.map((h) => h.id), [holdings]);
  useEffect(() => {
    if (!ids.length) return;
    fetchMarkets(ids).then((rows) => {
      const map: Record<string, Market> = {};
      rows.forEach((r) => (map[r.id] = r));
      setMarkets(map);
    });
  }, [ids]);

  const total = holdings.reduce((acc, h) => acc + (markets[h.id]?.current_price || 0) * h.amount, 0);

  const history = Array.from({ length: 30 }).map((_, i) => ({
    day: i + 1,
    value: total * (0.9 + Math.random() * 0.2),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-xl font-semibold">Portfolio</h2>
          <div className="text-muted-foreground text-sm">Mock portfolio. Connect wallet to replace with on-chain balances.</div>
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
            {holdings.map((h) => {
              const m = markets[h.id];
              const value = (m?.current_price || 0) * h.amount;
              return (
                <tr key={h.id} className="border-t hover:bg-muted/40">
                  <td className="px-4 py-3">
                    <div className="font-medium">{h.name}</div>
                    <div className="text-xs text-muted-foreground">{h.symbol}</div>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">{h.amount.toLocaleString()}</td>
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
