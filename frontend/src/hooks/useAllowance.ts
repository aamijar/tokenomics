import { useEffect, useState } from "react";
import { Address } from "viem";
import { useAccount, usePublicClient } from "wagmi";
import { ERC20_ABI } from "../abi/erc20";

export function useAllowance(token: Address | null, spender: Address | null) {
  const { address } = useAccount();
  const client = usePublicClient();
  const [value, setValue] = useState<bigint>(0n);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!client || !token || !address || !spender) {
        setValue(0n);
        return;
      }
      setLoading(true);
      try {
        const res = await client.readContract({
          address: token,
          abi: ERC20_ABI,
          functionName: "allowance",
          args: [address as Address, spender as Address],
        });
        if (!cancelled) setValue(res as bigint);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [client, token, address, spender]);
  return { allowance: value, loading };
}
