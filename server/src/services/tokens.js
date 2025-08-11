const DEFAULT_AI_TOKENS = [
  { id: "render-token", symbol: "RNDR", name: "Render" },
  { id: "the-graph", symbol: "GRT", name: "The Graph" },
  { id: "fetch-ai", symbol: "FET", name: "Fetch.ai" },
  { id: "singularitynet", symbol: "AGIX", name: "SingularityNET" },
  { id: "akash-network", symbol: "AKT", name: "Akash" },
  { id: "bittensor", symbol: "TAO", name: "Bittensor" },
  { id: "cyber", symbol: "CYBER", name: "Cyber" },
  { id: "ocean-protocol", symbol: "OCEAN", name: "Ocean" },
];

export default {
  async list() {
    return DEFAULT_AI_TOKENS;
  },
};
