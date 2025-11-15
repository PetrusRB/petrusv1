import ptBR from './locales/pt-BR.js';
import enUS from './locales/en-US.js';
import esES from './locales/es-ES.js';

type Locale = 'pt-BR' | 'en-US' | 'es-ES';

const translations = {
  'pt-BR': ptBR,
  'en-US': enUS,
  'es-ES': esES,
} as const;

export function t(
  locale: Locale,
  key: string,
  params?: Record<string, string | number>
): string {
  const keys = key.split('.');
  let value: any = translations[locale] || translations['en-US'];

  for (const k of keys) {
    value = value?.[k];
    if (value === undefined) {
      return key; // Retorna a chave se não encontrar tradução
    }
  }

  if (typeof value !== 'string') {
    return key;
  }

  // Substituir parâmetros {{param}}
  if (params) {
    return value.replace(/\{\{(\w+)\}\}/g, (_, param) => {
      return String(params[param] ?? `{{${param}}}`);
    });
  }

  return value;
}

export function getLocale(locale?: string): Locale {
  if (!locale) return 'pt-BR';

  // Normalizar locale
  const normalized = locale.toLowerCase().replace('_', '-');

  if (normalized.startsWith('pt')) return 'pt-BR';
  if (normalized.startsWith('es')) return 'es-ES';
  if (normalized.startsWith('en')) return 'en-US';

  return 'pt-BR'; // Fallback
}
