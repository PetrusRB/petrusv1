import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { z } from 'zod';

export const DEFAULT_AVATAR = '/user.png';
export const DEFAULT_BANNER = '/placeholder.png';
export const DEFAULT_NAME = 'Misterioso(a)';

export const CACHE_VERSION = 'v1'; // Útil para invalidar caches em deploys novos
export const ENV_PREFIX =
  process.env.NODE_ENV === 'production' ? 'prod' : 'dev';

export function getCacheKey(base: string): string {
  return `${ENV_PREFIX}:${base}`;
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export const usernameSlugSchema = z
  .string()
  .regex(/^[a-z0-9]+(\.[a-z0-9]+)*$/, 'Slug inválido')
  .max(100);

export function getInitials(name: string) {
  if (!name) return '';
  const initials = name
    ?.split(' ')
    .map((n: string) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return initials;
}
/**
 * Transforma um slug ou nome de usuário em uma string de busca normalizada.
 * Remove acentos e caracteres especiais, mantendo letras, números e separadores comuns.
 * Garante compatibilidade com buscas feitas no campo `normalized_name`.
 *
 * Exemplo:
 *  Input:  "PeDrO--_22335 "
 *  Output: "pedro.22335"
 *
 * @param username - Nome de usuário bruto inserido na busca
 * @returns String normalizada e pronta para consulta no banco
 */
export function slugToSearchQuery(username: string): string {
  return username
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove acentos
    .replace(/[^a-zA-Z0-9\s._-]/g, '') // remove tudo que não seja alfanumérico ou separadores
    .toLowerCase()
    .trim()
    .replace(/[\s._-]+/g, '.'); // substitui múltiplos separadores por ponto
}

// Format Numbers, Dates and Relative Times.
export function formatNumber(value: number): string {
  if (value < 1000) return value.toString();
  const units = [
    '',
    'k',
    'M',
    'B',
    'T',
    'Q',
    'Qi',
    'Sx',
    'Sp',
    'Oc',
    'No',
    'Dc',
  ];
  const unitIndex = Math.min(
    Math.floor(Math.log10(Math.abs(value)) / 3),
    units.length - 1
  );
  const scaledValue = value / Math.pow(1000, unitIndex);
  const formattedValue = scaledValue.toFixed(
    scaledValue >= 10 || unitIndex > 4 ? 0 : 1
  );
  return `${formattedValue}${units[unitIndex]}`;
}

// Format date to Brazilian Portuguese locale
export function formatRelativeTime(rawDate: string | Date | null): string {
  if (!rawDate) return '';

  const date = rawDate instanceof Date ? rawDate : new Date(rawDate);
  if (isNaN(date.getTime())) return '';

  const now = Date.now();
  const diffInSeconds = Math.floor((now - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'agora mesmo';

  const units = [
    { limit: 3600, singular: 'minuto', plural: 'minutos', divisor: 60 },
    { limit: 86400, singular: 'hora', plural: 'horas', divisor: 3600 },
    { limit: 2592000, singular: 'dia', plural: 'dias', divisor: 86400 },
    { limit: 31536000, singular: 'mês', plural: 'meses', divisor: 2592000 },
  ];

  for (const { limit, singular, plural, divisor } of units) {
    if (diffInSeconds < limit) {
      const value = Math.floor(diffInSeconds / divisor);
      const unit = value === 1 ? singular : plural;
      return `há ${value} ${unit}`;
    }
  }

  // Fallback para datas com mais de 1 ano
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

// Get file type from URL based on extension
export function getFileTypeFromUrl(url: string): 'image' | 'video' | 'unknown' {
  const extension = url.split('.').pop()?.toLowerCase();

  const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
  const videoExts = ['mp4', 'webm', 'ogg', 'mov'];

  if (extension && imageExts.includes(extension)) return 'image';
  if (extension && videoExts.includes(extension)) return 'video';
  return 'unknown';
}

// Fetch content type from URL using HEAD request
export async function fetchContentType(
  url: string
): Promise<'image' | 'video' | 'unknown'> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    const contentType = response.headers.get('Content-Type');

    if (contentType?.startsWith('image/')) return 'image';
    if (contentType?.startsWith('video/')) return 'video';
  } catch (err) {
    console.warn('Erro ao detectar tipo de conteúdo', err);
  }

  return 'unknown';
}
