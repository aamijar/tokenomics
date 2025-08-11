import { useEffect, useState } from "react";
import { fetchPools } from "@/services/backend";
import { formatCurrency } from "@/lib/format";

type Pool = {
  id: string;
  name: string;
  feeTierBps: number;
  tvlUSD: number;
  volume24hUSD: number;
  apr: number;
  chain: string;
};

export default function Pools() {
  const [loading, setLoading] = useState(true);
  const [tvl, setTvl] = useState(0);
  const [pools, setPools] = useState<Pool[]>([]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchPools()
      .then((d: { tvlUSD: number; pools: Pool[] }) => {
        if (!mounted) return;
        setTvl(d.tvlUSD || 0);
        setPools(d.pools || []);
      })
      .finally(() => setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Pools</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-lg border p-4">
          <div className="text-xs text-muted-foreground">Total TVL</div>
          <div className="text-2xl font-semibold">{formatCurrency(tvl)}</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-xs text-muted-foreground">Pools</div>
          <div className="text-2xl font-semibold">{pools.length}</div>
        </div>
      </div>

      <div className="rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="px-4 py-2 text-left">Pool</th>
              <th className="px-4 py-2 text-right">Fee</th>
              <th className="px-4 py-2 text-right">TVL</th>
              <th className="px-4 py-2 text-right">24h Volume</th>
              <th className="px-4 py-2 text-right">APR</th>
              <th className="px-4 py-2 text-right">Chain</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="px-4 py-6" colSpan={6}>Loading...</td>
              </tr>
            ) : pools.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-muted-foreground" colSpan={6}>No pools found</td>
              </tr>
            ) : (
              pools.map((p) => (
                <tr key={p.id} className="border-t hover:bg-muted/40">
                  <td className="px-4 py-3">{p.name}</td>
                  <td className="px-4 py-3 text-right">{(p.feeTierBps / 100).toFixed(2)}%</td>
                  <td className="px-4 py-3 text-right">{formatCurrency(p.tvlUSD)}</td>
                  <td className="px-4 py-3 text-right">{formatCurrency(p.volume24hUSD)}</td>
                  <td className="px-4 py-3 text-right">{p.apr.toFixed(2)}%</td>
                  <td className="px-4 py-3 text-right">{p.chain}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
