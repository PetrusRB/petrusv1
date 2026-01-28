import { getJsonFromCache, redis } from '../lib/redis.ts';

export async function cacheGet<T>(
  key: string,
  fetchFn: () => Promise<T | null>,
  ttlSeconds = 300
): Promise<T | null> {
  const cached = await redis.get<string>(key);
  if (cached) {
    try {
      return JSON.parse(cached) as T;
    } catch {
      /* fallback to DB */
    }
  }

  const fresh = await fetchFn();
  if (fresh !== null && fresh !== undefined) {
    await redis.set(key, JSON.stringify(fresh));
    if (ttlSeconds > 0) await redis.expire(key, ttlSeconds);
  }
  return fresh;
}

export async function cacheSet<T>(key: string, value: T, ttlSeconds = 300) {
  await redis.set(key, JSON.stringify(value));
  if (ttlSeconds > 0) await redis.expire(key, ttlSeconds);
}

export async function cacheDel(key: string) {
  await redis.del(key);
}
