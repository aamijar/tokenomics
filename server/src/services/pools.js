export default {
  async overview() {
    return {
      tvlUSD: 124500000,
      pools: [
        {
          id: "rndr-grt-3000",
          name: "RNDR/GRT",
          feeTierBps: 300,
          tvlUSD: 3250000,
          volume24hUSD: 410000,
          apr: 12.5,
          chain: "Ethereum",
        },
        {
          id: "fet-ocean-500",
          name: "FET/OCEAN",
          feeTierBps: 50,
          tvlUSD: 1870000,
          volume24hUSD: 220000,
          apr: 9.1,
          chain: "Base",
        },
      ],
    };
  },
};
