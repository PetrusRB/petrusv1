export function isValidSnowflake(s: string): boolean {
  return /^(\d{17,19})$/gi.test((s || '').trim());
}

export * from './utils/embed.ts';
