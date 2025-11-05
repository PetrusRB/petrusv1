// Sanitizador simples e seguro
export function sanitizeMessage(
  raw: string,
  opts?: { allowLinks?: boolean; maxLen?: number }
) {
  const allowLinks = !!opts?.allowLinks;
  const maxLen = opts?.maxLen ?? 1000;

  let s = raw;

  // remover/neutralizar menções diretas e de cargo
  s = s.replace(/@everyone/gi, '[everyone]');
  s = s.replace(/@here/gi, '[here]');
  s = s.replace(/<@!?\d+>/g, '[usuário]');
  s = s.replace(/<@&\d+>/g, '[cargo]');

  // remover links (phishing/spam)
  if (!allowLinks) {
    s = s.replace(/https?:\/\/\S+/gi, '[link removido]');
    s = s.replace(/www\.\S+\.\S+/gi, '[link removido]');
  }

  // escapar caracteres de markdown que podem transformar formato (neat & safe)
  // evita bold/italic/code/blockquote/tables/strike/pipe etc.
  s = s.replace(/\\/g, '\\\\'); // primeiro escape backslashes
  s = s.replace(/([*_~`|>])/g, '\\$1');

  // Normalizar espaços e cortar no tamanho desejado
  s = s.replace(/\s{2,}/g, ' ').trim();
  if (s.length > maxLen) s = s.slice(0, maxLen) + '…';

  return s;
}
