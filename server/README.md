Server (API Aggregator)

Local development
- cd server
- npm ci
- cp .env.example .env
- npm run dev

Env
- PORT: default 8787
- CORS_ORIGIN: default *
- COINGECKO_BASE: default https://api.coingecko.com/api/v3
- QUOTE_PROVIDER: mock | uniswapx | 1inch (mock default)
- ONEINCH_BASE, ONEINCH_API_KEY: when using 1inch
- UNISWAP_BASE: when using Uniswap APIs
- ETH_RPC_URL, BASE_RPC_URL, ARBITRUM_RPC_URL: optional for future on-chain queries

Endpoints
- GET /health
- GET /api/tokens -> curated AI tokens
- GET /api/prices?ids=render-token,the-graph -> CoinGecko markets passthrough with caching
- GET /api/quotes?fromToken=&amp;toToken=&amp;amount=&amp;chainId=1 -> quote provider (mock by default)
- GET /api/activity/:address -> placeholder
- GET /api/pools -> placeholder

Notes
- Starts mock-compatible for FE integration. Swap execution and richer analytics can be enabled by setting QUOTE_PROVIDER and adding RPC/subgraph credentials.
