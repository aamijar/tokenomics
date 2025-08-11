import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { marketChart, tokenInfo } from '@/services/coingecko';
import { formatCurrency, formatPct } from '@/lib/format';
import { Button } from '@/components/ui/button';

type Info = {
  id: string;
  name: string;
  symbol: string;
  image: { small: string; large: string };
  market_data?: {
    current_price: { usd: number };
    price_change_percentage_24h?: number;
    market_cap?: { usd: number };
    total_volume?: { usd: number };
  };
};

export default function TokenPage() {
  const { id } = useParams<{ id: string }>();
  const [info, setInfo] = useState<Info | null>(null);
  const [prices, setPrices] = useState<[number, number][]>([]);
  const [days, setDays] = useState(7);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!id) return;
      setLoading(true);
      try {
        const [i, ch] = await Promise.all([tokenInfo(id), marketChart(id, days)]);
        if (!mounted) return;
        setInfo(i);
        setPrices(ch.prices || []);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [id, days]);

  const chartData = useMemo(() => prices.map(([t, p]) => ({ t, p })), [prices]);

  if (!id) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {info?.image?.small && <img src={info.image.small} alt={info?.symbol} className="size-10 rounded-full" />}
          <div>
            <div className="text-xl font-semibold">{info?.name}</div>
            <div className="text-sm text-muted-foreground">{info?.symbol?.toUpperCase()}</div>
          </div>
        </div>
        <Link to="/" className="text-sm text-muted-foreground hover:underline">← Back</Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border p-4 bg-card">
          <div className="text-muted-foreground text-xs">Price</div>
          <div className="text-2xl font-semibold">
            {info?.market_data?.current_price?.usd ? formatCurrency(info.market_data.current_price.usd) : '-'}
          </div>
          <div className={`text-sm ${((info?.market_data?.price_change_percentage_24h || 0) >= 0) ? 'text-emerald-500' : 'text-red-500'}`}>
            {info?.market_data?.price_change_percentage_24h != null ? formatPct(info.market_data.price_change_percentage_24h) : '-'}
          </div>
        </div>
        <div className="rounded-lg border p-4 bg-card">
          <div className="text-muted-foreground text-xs">Market Cap</div>
          <div className="text-xl font-medium">
            {info?.market_data?.market_cap?.usd ? formatCurrency(info.market_data.market_cap.usd) : '-'}
          </div>
        </div>
        <div className="rounded-lg border p-4 bg-card">
          <div className="text-muted-foreground text-xs">24h Volume</div>
          <div className="text-xl font-medium">
            {info?.market_data?.total_volume?.usd ? formatCurrency(info.market_data.total_volume.usd) : '-'}
          </div>
        </div>
      </div>

      <div className="rounded-lg border p-4 bg-card">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-medium">Price Chart</div>
          <div className="flex gap-2">
            <Button size="sm" variant={days === 1 ? 'default' : 'outline'} onClick={() => setDays(1)}>24h</Button>
            <Button size="sm" variant={days === 7 ? 'default' : 'outline'} onClick={() => setDays(7)}>7d</Button>
            <Button size="sm" variant={days === 30 ? 'default' : 'outline'} onClick={() => setDays(30)}>30d</Button>
          </div>
        </div>
        <div className="h-64 w-full">
          {loading ? (
            <div className="flex items-center justify-center h-full text-sm text-muted-foreground">Loading chart...</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis dataKey="t" hide />
                <YAxis hide />
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
                <Line type="monotone" dataKey="p" dot={false} stroke="#8b5cf6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
