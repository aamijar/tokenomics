import NodeCache from "node-cache";

const ttl = 30; // seconds
const cache = new NodeCache({ stdTTL: ttl });

export function getCache(key) {
  return cache.get(key);
}

export function setCache(key, val, seconds = ttl) {
  cache.set(key, val, seconds);
  return val;
}
