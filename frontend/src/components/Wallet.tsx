import { useEffect, useMemo, useState } from "react";

type Account = { address: string } | null;

type Ethereum = {
  request: <T = unknown>(args: { method: string }) => Promise<T>;
  on?: (event: string, handler: (accs: string[]) => void) => void;
  removeListener?: (event: string, handler: (accs: string[]) => void) => void;
};

export function WalletConnect() {
  const [account, setAccount] = useState<Account>(null);

  useEffect(() => {
    const eth = (window as unknown as { ethereum?: Ethereum }).ethereum;
    if (!eth) return;
    eth.request<string[]>({ method: "eth_accounts" }).then((accs) => {
      if (accs?.[0]) setAccount({ address: accs[0] });
    });
    const handler = (accs: string[]) => setAccount(accs?.[0] ? { address: accs[0] } : null);
    eth.on?.("accountsChanged", handler);
    return () => eth.removeListener?.("accountsChanged", handler);
  }, []);

  const short = useMemo(() => {
    if (!account?.address) return "";
    return account.address.slice(0, 6) + "…" + account.address.slice(-4);
  }, [account]);

  const connect = async () => {
    const eth = (window as unknown as { ethereum?: Ethereum }).ethereum;
    if (!eth) return;
    const accs = await eth.request<string[]>({ method: "eth_requestAccounts" });
    if (accs?.[0]) setAccount({ address: accs[0] });
  };

  return account ? (
    <div className="rounded-full border px-3 py-1 text-sm">{short}</div>
  ) : (
    <button className="rounded-full bg-primary text-primary-foreground px-3 py-1 text-sm" onClick={connect}>
      Connect
    </button>
  );
}
