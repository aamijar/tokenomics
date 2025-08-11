import { useEffect, useMemo, useState } from "react";
import { fetchActivity } from "@/services/backend";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Item = {
  type: string;
  hash: string;
  timestamp: number;
  summary: string;
  status: "pending" | "success" | "failed";
  chain: string;
};

const chainExplorer = (chain: string) => {
  const c = chain.toLowerCase();
  if (c.includes("base")) return "https://basescan.org";
  if (c.includes("eth") || c.includes("mainnet")) return "https://etherscan.io";
  return "";
};

export default function Activity() {
  const [address, setAddress] = useState("0x0000000000000000000000000000000000000000");
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);

  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [chainFilter, setChainFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

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

  const filtered = useMemo(() => {
    return items.filter((it) => {
      const byType = typeFilter === "all" || it.type === typeFilter;
      const byChain = chainFilter === "all" || it.chain.toLowerCase().includes(chainFilter.toLowerCase());
      const byStatus = statusFilter === "all" || it.status === statusFilter;
      return byType && byChain && byStatus;
    });
  }, [items, typeFilter, chainFilter, statusFilter]);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Activity</h2>

      <div className="flex flex-col gap-2 md:flex-row md:items-center">
        <div className="flex gap-2 flex-1">
          <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Wallet address" />
          <Button onClick={load} disabled={loading}>{loading ? "Loading..." : "Load"}</Button>
        </div>
        <div className="flex gap-2">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-32"><SelectValue placeholder="Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="swap">Swap</SelectItem>
              <SelectItem value="approve">Approve</SelectItem>
              <SelectItem value="transfer">Transfer</SelectItem>
            </SelectContent>
          </Select>
          <Select value={chainFilter} onValueChange={setChainFilter}>
            <SelectTrigger className="w-32"><SelectValue placeholder="Chain" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All chains</SelectItem>
              <SelectItem value="ethereum">Ethereum</SelectItem>
              <SelectItem value="base">Base</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="success">Success</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="px-4 py-2 text-left">Summary</th>
              <th className="px-4 py-2">Type</th>
              <th className="px-4 py-2">Chain</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Tx</th>
              <th className="px-4 py-2 text-right">Time</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="px-4 py-6" colSpan={6}>Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td className="px-4 py-6 text-muted-foreground" colSpan={6}>No activity found</td></tr>
            ) : (
              filtered.map((it) => {
                const base = chainExplorer(it.chain);
                const href = base ? `${base}/tx/${it.hash}` : undefined;
                return (
                  <tr key={it.hash} className="border-t hover:bg-muted/40">
                    <td className="px-4 py-3">{it.summary}</td>
                    <td className="px-4 py-3 text-center">{it.type}</td>
                    <td className="px-4 py-3 text-center">{it.chain}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${it.status === "success" ? "bg-emerald-500/10 text-emerald-600" : it.status === "failed" ? "bg-red-500/10 text-red-600" : "bg-amber-500/10 text-amber-600"}`}>
                        {it.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {href ? <a className="text-primary hover:underline" href={href} target="_blank" rel="noreferrer">View</a> : "-"}
                    </td>
                    <td className="px-4 py-3 text-right">{new Date(it.timestamp * 1000).toLocaleString()}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
