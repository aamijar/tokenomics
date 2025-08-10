import { useState } from 'react';
import { AI_TOKEN_IDS } from '@/config';

export default function Swap() {
  const [from, setFrom] = useState(AI_TOKEN_IDS[0].id);
  const [to, setTo] = useState(AI_TOKEN_IDS[1].id);
  const [amount, setAmount] = useState('');

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Swap</h2>
      <div className="rounded-lg border p-4 max-w-lg">
        <div className="space-y-3">
          <div>
            <div className="text-xs text-muted-foreground mb-1">From</div>
            <select className="w-full rounded-md border bg-background px-3 py-2" value={from} onChange={(e) => setFrom(e.target.value)}>
              {AI_TOKEN_IDS.map((t) => (
                <option key={t.id} value={t.id}>{t.symbol}</option>
              ))}
            </select>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">To</div>
            <select className="w-full rounded-md border bg-background px-3 py-2" value={to} onChange={(e) => setTo(e.target.value)}>
              {AI_TOKEN_IDS.map((t) => (
                <option key={t.id} value={t.id}>{t.symbol}</option>
              ))}
            </select>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">Amount</div>
            <input className="w-full rounded-md border bg-background px-3 py-2" placeholder="0.0" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
          <button className="w-full rounded-md bg-primary text-primary-foreground px-3 py-2">
            Get Quote
          </button>
          <div className="text-xs text-muted-foreground">
            Quotes and execution can be wired to Uniswap or 1inch; env-configurable. This is a UI scaffold.
          </div>
        </div>
      </div>
    </div>
  );
}
