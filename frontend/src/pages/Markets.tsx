import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AI_TOKEN_IDS } from '@/config';
import { fetchBackendMarkets as fetchMarkets } from '@/services/backend';
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
import { formatCurrency, formatPct } from '@/lib/format';
import { Line, LineChart, ResponsiveContainer, Tooltip } from 'recharts';

export default function Markets() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<Market[]>([]);

  const ids = useMemo(() => AI_TOKEN_IDS.map((t) => t.id), []);
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchMarkets(ids)
      .then((d: Market[]) => mounted && setRows(d))
      .finally(() => setLoading(false));
    const int = setInterval(() => {
      fetchMarkets(ids).then((d: Market[]) => mounted && setRows(d));
    }, 60_000);
    return () => {
      mounted = false;
      clearInterval(int);
    };
  }, [ids]);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Markets</h2>
      <div className="rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="px-4 py-2 text-left">Token</th>
              <th className="px-4 py-2 text-right">Price</th>
              <th className="px-4 py-2 text-right">24h</th>
              <th className="px-4 py-2">7d</th>
              <th className="px-4 py-2 text-right">Market Cap</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="px-4 py-6" colSpan={5}>Loading...</td></tr>
            ) : rows.map((r) => (
              <tr key={r.id} className="border-t hover:bg-muted/40">
                <td className="px-4 py-3">
                  <Link to={`/token/${r.id}`} className="flex items-center gap-3 hover:underline">
                    <img src={r.image} alt={r.symbol} className="size-6 rounded-full" />
                    <div>
                      <div className="font-medium">{r.name}</div>
                      <div className="text-xs text-muted-foreground">{r.symbol.toUpperCase()}</div>
                    </div>
                  </Link>
                </td>
                <td className="px-4 py-3 text-right tabular-nums">{formatCurrency(r.current_price)}</td>
                <td className={`px-4 py-3 text-right tabular-nums ${r.price_change_percentage_24h >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                  {formatPct(r.price_change_percentage_24h)}
                </td>
                <td className="px-4 py-3">
                  <div className="h-10 w-40">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={(r.sparkline_in_7d?.price || []).map((y, i) => ({ i, y }))}>
                        <Tooltip formatter={(v: number) => formatCurrency(v)} />
                        <Line type="monotone" dataKey="y" dot={false} stroke={r.price_change_percentage_24h >= 0 ? '#10b981' : '#ef4444'} strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </td>
                <td className="px-4 py-3 text-right tabular-nums">{formatCurrency(r.market_cap)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
