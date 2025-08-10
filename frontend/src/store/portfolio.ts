import { create } from 'zustand';

type Holding = { id: string; symbol: string; name: string; amount: number };

type State = {
  holdings: Holding[];
  setHolding: (id: string, updater: Partial<Holding>) => void;
};

export const usePortfolio = create<State>((set) => ({
  holdings: [
    { id: 'render-token', symbol: 'RNDR', name: 'Render', amount: 120 },
    { id: 'the-graph', symbol: 'GRT', name: 'The Graph', amount: 1000 },
    { id: 'fetch-ai', symbol: 'FET', name: 'Fetch.ai', amount: 800 },
  ],
  setHolding: (id, updater) =>
    set((s) => ({
      holdings: s.holdings.map((h) => (h.id === id ? { ...h, ...updater } : h)),
    })),
}));
