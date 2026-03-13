const memoryCache = new Map();

function now() {
  return Date.now();
}

function readSession(key) {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data || typeof data !== 'object') return null;
    return data;
  } catch {
    return null;
  }
}

function writeSession(key, data) {
  try {
    sessionStorage.setItem(key, JSON.stringify(data));
  } catch {
    return;
  }
}

export function getCachedValue(key, ttlMs) {
  const current = now();
  const memory = memoryCache.get(key);
  if (memory && current - memory.timestamp < ttlMs) {
    return memory.value;
  }
  const session = readSession(key);
  if (session && current - session.timestamp < ttlMs) {
    memoryCache.set(key, session);
    return session.value;
  }
  return null;
}

export function setCachedValue(key, value) {
  const data = { value, timestamp: now() };
  memoryCache.set(key, data);
  writeSession(key, data);
}

export async function fetchWithCache(key, fetcher, ttlMs = 60000) {
  const cached = getCachedValue(key, ttlMs);
  if (cached !== null) {
    return cached;
  }
  const value = await fetcher();
  setCachedValue(key, value);
  return value;
}

export function invalidateCache(prefix = '') {
  const keys = Array.from(memoryCache.keys());
  keys.forEach((key) => {
    if (!prefix || key.startsWith(prefix)) {
      memoryCache.delete(key);
      try {
        sessionStorage.removeItem(key);
      } catch {
        return;
      }
    }
  });
}
