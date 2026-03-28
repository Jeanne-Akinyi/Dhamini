/**
 * Simple in-memory cache utility (no Redis dependency)
 * For MVP mode and development
 */

const cache = new Map();
const DEFAULT_TTL = 300000; // 5 minutes in milliseconds

/**
 * Set a value in cache with optional TTL
 * @param {string} key - Cache key
 * @param {any} value - Value to cache
 * @param {number} ttl - Time to live in milliseconds (optional)
 */
function set(key, value, ttl = DEFAULT_TTL) {
  const expiry = Date.now() + ttl;
  cache.set(key, { value, expiry });
}

/**
 * Get a value from cache
 * @param {string} key - Cache key
 * @returns {any} Cached value or null if not found/expired
 */
function get(key) {
  const item = cache.get(key);
  if (!item) {
    return null;
  }
  
  // Check if expired
  if (Date.now() > item.expiry) {
    cache.delete(key);
    return null;
  }
  
  return item.value;
}

/**
 * Delete a value from cache
 * @param {string} key - Cache key
 */
function del(key) {
  cache.delete(key);
}

/**
 * Clear all cache
 */
function clear() {
  cache.clear();
}

/**
 * Clean up expired cache entries
 */
function cleanup() {
  const now = Date.now();
  for (const [key, item] of cache.entries()) {
    if (now > item.expiry) {
      cache.delete(key);
    }
  }
}

// Clean up expired entries every 5 minutes
setInterval(cleanup, 300000);

module.exports = {
  set,
  get,
  del,
  clear,
  cleanup
};
