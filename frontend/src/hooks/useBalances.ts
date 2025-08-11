import { useEffect, useState } from "react";
import { useAccount, useChainId, usePublicClient } from "wagmi";
import { Address, formatUnits } from "viem";
import { ERC20_ABI } from "@/abi/erc20";
import { fetchTokenAddresses } from "@/services/backend";

type Balance = { id: string; address: Address; decimals: number; raw: bigint; amount: number };

function chainKey(chainId: number): "ethereum" | "base" | string {
  if (chainId === 1) return "ethereum";
  if (chainId === 8453) return "base";
  return "ethereum";
}

export function useBalances(tokenIds: string[]) {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const client = usePublicClient();
  const [balances, setBalances] = useState<Record<string, Balance>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const active = isConnected && !!address && !!client && tokenIds.length > 0;

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!active) {
        setBalances({});
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const { items } = await fetchTokenAddresses(tokenIds);
        const key = chainKey(chainId);
        const addrs = items
          .map((it) => ({ id: it.id, addr: (it.addresses?.[key] || "") as string }))
          .filter((x) => x.addr && x.addr.length > 0) as { id: string; addr: Address }[];

        if (addrs.length === 0) {
          setBalances({});
          return;
        }

        const decCalls = addrs.map((a) => ({ address: a.addr, abi: ERC20_ABI, functionName: "decimals" as const }));
        const balCalls = addrs.map((a) => ({ address: a.addr, abi: ERC20_ABI, functionName: "balanceOf" as const, args: [address as Address] }));

        const [decRes, balRes] = await Promise.all([
          client!.multicall({ contracts: decCalls }),
          client!.multicall({ contracts: balCalls }),
        ]);

        const out: Record<string, Balance> = {};
        addrs.forEach((t, i) => {
          const decVal = (decRes as Array<{ result?: unknown }>)[i]?.result;
          const rawVal = (balRes as Array<{ result?: unknown }>)[i]?.result;
          const dec = typeof decVal === "bigint" ? Number(decVal) : typeof decVal === "number" ? decVal : undefined;
          const raw = typeof rawVal === "bigint" ? rawVal : undefined;
          if (typeof dec === "number" && typeof raw === "bigint") {
            const amount = parseFloat(formatUnits(raw, dec));
            out[t.id] = { id: t.id, address: t.addr, decimals: dec, raw, amount };
          }
        });
        if (!cancelled) setBalances(out);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        if (!cancelled) setError(msg);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [active, address, chainId, client, tokenIds.join(",")]);

  return { balances, loading, error, isConnected };
}
