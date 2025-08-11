export default {
  async forAddress(address) {
    return {
      address,
      items: [
        {
          type: "swap",
          hash: "0xswap1",
          timestamp: Math.floor(Date.now() / 1000) - 3600,
          summary: "Swapped 100 RNDR for 99 GRT",
          status: "success",
          chain: "Ethereum",
        },
        {
          type: "approve",
          hash: "0xapprove1",
          timestamp: Math.floor(Date.now() / 1000) - 7200,
          summary: "Approved RNDR for trading",
          status: "success",
          chain: "Ethereum",
        },
        {
          type: "swap",
          hash: "0xswap2",
          timestamp: Math.floor(Date.now() / 1000) - 86000,
          summary: "Swapped 50 FET for 49 OCEAN",
          status: "failed",
          chain: "Base",
        },
      ],
    };
  },
};
