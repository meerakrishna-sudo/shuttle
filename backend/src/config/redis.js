/**
 * Redis client setup.
 *
 * Redis is an in-memory key-value store. We use it as a cache layer:
 * instead of hitting MongoDB every time someone requests route data,
 * we store the result in Redis for a few minutes. Redis reads are ~0.1ms
 * vs MongoDB reads which can be 10-50ms depending on indexes and data size.
 *
 * We only enable Redis if REDIS_URL is set. This lets the app run without
 * Redis in simple dev setups or tests — cache functions just return null.
 */
const Redis = require('ioredis');
const logger = require('../utils/logger');

let client = null;

const connectRedis = async () => {
  if (!process.env.REDIS_URL) {
    logger.warn('REDIS_URL not set — running without cache');
    return;
  }

  client = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: 3,
    lazyConnect: true,
  });

  client.on('connect', () => logger.info('Redis connected'));
  client.on('error', (err) => logger.error('Redis error', { error: err.message }));

  await client.connect();
};

const getCache = async (key) => {
  if (!client) return null;
  try {
    const value = await client.get(key);
    return value ? JSON.parse(value) : null;
  } catch {
    return null; // cache miss is not fatal
  }
};

const setCache = async (key, value, ttlSeconds = 300) => {
  if (!client) return;
  try {
    await client.setex(key, ttlSeconds, JSON.stringify(value));
  } catch {
    // cache write failure is not fatal
  }
};

const deleteCache = async (key) => {
  if (!client) return;
  try {
    await client.del(key);
  } catch {}
};

const deleteCacheByPattern = async (pattern) => {
  if (!client) return;
  try {
    const keys = await client.keys(pattern);
    if (keys.length > 0) await client.del(...keys);
  } catch {}
};

module.exports = { connectRedis, getCache, setCache, deleteCache, deleteCacheByPattern };
