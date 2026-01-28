export const CACHE_VERSION = 'v1'; // Útil para invalidar caches em deploys novos
export const ENV_PREFIX =
  process.env.NODE_ENV === 'production' ? 'prod' : 'dev';

export function getCacheKey(base: string): string {
  return `${ENV_PREFIX}:${base}`;
}
