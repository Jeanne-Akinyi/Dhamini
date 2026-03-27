const Redis = require('ioredis');
const logger = require('../utils/logger.util');

// MVP mode check
const isMVPMode = process.env.MVP_MODE === 'true';
const useRedisFallback = process.env.MVP_REDIS_FALLBACK === 'true' || isMVPMode;

// In-memory storage for MVP mode
let memoryCache = {};

// Create Redis client (only if not in MVP mode with fallback)
let redis = null;
let redisAvailable = false;

if (!useRedisFallback) {
  try {
    redis = new Redis({
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: parseInt(process.env.REDIS_PORT) || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
      db: parseInt(process.env.REDIS_DB) || 0,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: 3
    });

    redis.on('connect', () => {
      redisAvailable = true;
      logger.info('Redis connected successfully');
    });

    redis.on('error', (error) => {
      redisAvailable = false;
      logger.error('Redis connection error:', error);
      if (useRedisFallback) {
        logger.warn('Falling back to in-memory cache for MVP mode');
      }
    });

    redis.on('ready', () => {
      redisAvailable = true;
      logger.info('Redis ready to accept commands');
    });

    redis.on('close', () => {
      redisAvailable = false;
      logger.warn('Redis connection closed');
    });
  } catch (error) {
    logger.error('Failed to initialize Redis:', error);
    redisAvailable = false;
  }
} else {
  logger.info('MVP Mode: Using in-memory cache (Redis disabled)');
}

// Cache helper functions
const cache = {
  async set(key, value, ttl = 3600) {
    if (redisAvailable && redis) {
      try {
        await redis.setex(key, ttl, JSON.stringify(value));
        return true;
      } catch (error) {
        logger.error(`Cache set error for key ${key}:`, error);
        redisAvailable = false;
        // Fall back to in-memory
      }
    }

    // In-memory fallback
    memoryCache[key] = {
      value: value,
      expiry: Date.now() + (ttl * 1000)
    };
    logger.debug(`Memory cache set for key: ${key} (TTL: ${ttl}s)`);
    return true;
  },

  async get(key) {
    if (redisAvailable && redis) {
      try {
        const value = await redis.get(key);
        if (value) {
          return JSON.parse(value);
        }
      } catch (error) {
        logger.error(`Cache get error for key ${key}:`, error);
        redisAvailable = false;
        // Fall back to in-memory
      }
    }

    // In-memory fallback
    const item = memoryCache[key];
    if (!item) {
      return null;
    }

    // Check if expired
    if (Date.now() > item.expiry) {
      delete memoryCache[key];
      return null;
    }

    return item.value;
  },

  async del(key) {
    if (redisAvailable && redis) {
      try {
        await redis.del(key);
      } catch (error) {
        logger.error(`Cache delete error for key ${key}:`, error);
        redisAvailable = false;
      }
    }

    // In-memory fallback
    delete memoryCache[key];
    return true;
  },

  async invalidatePattern(pattern) {
    let count = 0;

    if (redisAvailable && redis) {
      try {
        const keys = await redis.keys(pattern);
        if (keys.length > 0) {
          await redis.del(keys);
          count = keys.length;
        }
      } catch (error) {
        logger.error(`Cache invalidate pattern error for ${pattern}:`, error);
        redisAvailable = false;
      }
    }

    // In-memory fallback - simple key matching
    if (pattern.includes('*')) {
      const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
      const keysToDelete = Object.keys(memoryCache).filter(key => regex.test(key));
      keysToDelete.forEach(key => delete memoryCache[key]);
      count += keysToDelete.length;
    }

    logger.info(`Invalidated ${count} cache entries matching pattern: ${pattern}`);
    return count;
  }
};

// Connection functions
const connect = async () => {
  if (redisAvailable && redis) {
    await redis.connect();
  }
  return true;
};

const disconnect = async () => {
  if (redisAvailable && redis) {
    await redis.quit();
  }
  memoryCache = {};
  redisAvailable = false;
  logger.info('Cache disconnected');
};

module.exports = { redis, cache, connect, disconnect, redisAvailable };
