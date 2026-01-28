import { Redis } from '@upstash/redis';
import {
  CACHE_VERSION,
  ENV_PREFIX,
  getCacheKey,
} from '../discord/utils/redis.utils.ts';

export const redis = Redis.fromEnv();

interface RateLimitOptions {
  keyPrefix: string;
  points: number;
  duration: number; // em segundos
}
/**
 * Função para consumir pontos de um rate limit
 */
export function withRateLimit({
  keyPrefix,
  points,
  duration,
}: RateLimitOptions) {
  return {
    async consume(identifier: string) {
      const key = `${keyPrefix}:${identifier}`;

      const current = await redis.incr(key);

      // Primeira requisição cria a janela
      if (current === 1) {
        await redis.expire(key, duration);
      }

      if (current > points) {
        throw new Error('Rate limit exceeded');
      }

      return {
        remaining: Math.max(0, points - current),
      };
    },
  };
}
/**
 * Função para validar um id de um objeto
 * @param id - ID do objeto
 */
export function validateObjectId(id: string): boolean {
  return /^[a-f\d]{24}$/i.test(id);
}

/**
 * Função para pegar do cache (json)
 * @param key - Chave do Redis
 */
export async function getJsonFromCache<T>(key: string): Promise<T | null> {
  try {
    const cachedData = await redis.get(key);
    if (cachedData === null || cachedData === undefined) return null;

    // Verifica se já é um objeto (às vezes o Redis client faz parse automático)
    if (typeof cachedData === 'object') return cachedData as T;

    // Garantia de string e limpeza
    const cachedString = String(cachedData)
      .replace(new RegExp(`^${ENV_PREFIX}:`), '')
      .replace(new RegExp(`^${CACHE_VERSION}:`), '')
      .trim();

    try {
      return JSON.parse(cachedString);
    } catch {
      // Se ainda falhar, retorna null para buscar no banco
      return null;
    }
  } catch (error) {
    console.error(`Erro ao acessar cache para key ${key}:`, error);
    return null;
  }
}

/**
 * Função para armazenar no cache
 * @param key - Chave do Redis
 * @param data - Dados a serem armazenados
 * @param ttl - Tempo de cache (em segundos)
 */
export async function setJsonInCache(
  key: string,
  data: any,
  ttl?: number
): Promise<void> {
  const cacheKey = getCacheKey(key);

  try {
    const value = JSON.stringify(data);
    if (ttl) {
      await redis.setex(cacheKey, ttl, value);
    } else {
      await redis.set(cacheKey, value);
    }
  } catch (error) {
    console.error(`Erro ao salvar no cache para key ${cacheKey}:`, error);
  }
}
/**
 * Pega do cache se existir, ou seta o valor com TTL.
 * @param key - Chave do Redis
 * @param fetcher - Função que retorna os dados
 * @param ttlSeconds - Tempo de cache (em segundos)
 */
export async function getOrSet<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds?: number
): Promise<T> {
  // forçamos o tipo pra string ou null
  const cached = await redis.get<string>(key);

  if (cached !== null && cached !== undefined) {
    try {
      // Se já for um objeto (redis client pode fazer parse automático)
      if (typeof cached === 'object') {
        return cached as T;
      }

      // Se for string, faz parse
      if (typeof cached === 'string') {
        const parsed = JSON.parse(cached);
        return parsed as T;
      }

      // Para outros tipos (number, boolean), converte
      return cached as T;
    } catch (error) {
      console.warn(`Erro ao parsear cache para key ${key}:`, error);
      // Continua para buscar dados frescos
    }
  }

  // Busca dados frescos
  const fresh = await fetcher();

  // Serializa apenas se não for primitivo
  let valueToStore: any = fresh;
  if (fresh !== null && typeof fresh === 'object') {
    valueToStore = JSON.stringify(fresh);
  }

  // Se vier TTL, passa na opção; senão, só seta sem expirar
  if (typeof ttlSeconds === 'number') {
    await redis.set(key, valueToStore, { ex: ttlSeconds });
  } else {
    await redis.set(key, valueToStore);
  }

  return fresh;
}

/**
 * Deleta todas as chaves que casam com um padrão.
 */
export async function delByPattern(pattern: string): Promise<void> {
  const keys = await redis.keys(pattern);
  if (keys.length > 0) {
    await redis.del(...keys);
  }
}
