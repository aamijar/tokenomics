export const COINGECKO_BASE = import.meta.env.VITE_COINGECKO_BASE || 'https://api.coingecko.com/api/v3';

export const AI_TOKEN_IDS: { id: string; symbol: string; name: string }[] = [
  { id: 'render-token', symbol: 'RNDR', name: 'Render' },
  { id: 'the-graph', symbol: 'GRT', name: 'The Graph' },
  { id: 'bittensor', symbol: 'TAO', name: 'Bittensor' },
  { id: 'fetch-ai', symbol: 'FET', name: 'Fetch.ai' },
  { id: 'singularitynet', symbol: 'AGIX', name: 'SingularityNET' },
  { id: 'ocean-protocol', symbol: 'OCEAN', name: 'Ocean Protocol' },
  { id: 'worldcoin-wld', symbol: 'WLD', name: 'Worldcoin' },
  { id: 'ai16z', symbol: 'AI16Z', name: 'ai16z' },
];

export const WALLETCONNECT_PROJECT_ID =
  (import.meta.env.VITE_WALLETCONNECT_PROJECT_ID as string | undefined) || undefined;
