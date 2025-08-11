import { useEffect, useState } from "react";
import { fetchActivity } from "@/services/backend";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Item = {
  type: string;
  hash: string;
  timestamp: number;
  summary: string;
  status: "pending" | "success" | "failed";
  chain: string;
};

export default function Activity() {
  const [address, setAddress] = useState("0x0000000000000000000000000000000000000000");
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const d = await fetchActivity(address);
      setItems(d.items as Item[]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Activity</h2>

      <div className="flex gap-2">
        <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Wallet address" />
        <Button onClick={load} disabled={loading}>{loading ? "Loading..." : "Load"}</Button>
      </div>

      <div className="rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="px-4 py-2 text-left">Summary</th>
              <th className="px-4 py-2">Type</th>
              <th className="px-4 py-2">Chain</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2 text-right">Time</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="px-4 py-6" colSpan={5}>Loading...</td></tr>
            ) : items.length === 0 ? (
              <tr><td className="px-4 py-6 text-muted-foreground" colSpan={5}>No activity found</td></tr>
            ) : (
              items.map((it) => (
                <tr key={it.hash} className="border-t hover:bg-muted/40">
                  <td className="px-4 py-3">{it.summary}</td>
                  <td className="px-4 py-3 text-center">{it.type}</td>
                  <td className="px-4 py-3 text-center">{it.chain}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${it.status === "success" ? "bg-emerald-500/10 text-emerald-600" : it.status === "failed" ? "bg-red-500/10 text-red-600" : "bg-amber-500/10 text-amber-600"}`}>
                      {it.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">{new Date(it.timestamp * 1000).toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
