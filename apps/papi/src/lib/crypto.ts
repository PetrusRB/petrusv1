import sodium from 'libsodium-wrappers';
import crypto from 'crypto';

const ready = sodium.ready;

export async function initSodium() {
  await ready;
}

export const generateSafeId = (prefix = 'id') =>
  `${prefix}_${crypto.randomBytes(8).toString('hex')}`;

export const safeJSON = (data: unknown) => JSON.parse(JSON.stringify(data));

export function encryptString(plain: string, keyBase64: string): string {
  // Aguarda o sodium estar pronto se necessário
  if (!sodium.ready) {
    throw new Error('Sodium not initialized. Call initSodium() first.');
  }

  const key = Buffer.from(keyBase64, 'base64');
  const nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);

  // Converte a string para Uint8Array explicitamente
  const plainBytes = sodium.from_string(plain);

  // Chama a função com tipos explícitos
  const cipher = sodium.crypto_secretbox_easy(
    plainBytes,
    nonce as Uint8Array,
    key as Uint8Array
  );

  const out = Buffer.concat([
    Buffer.from(nonce as Uint8Array),
    Buffer.from(cipher as Uint8Array),
  ]);

  return out.toString('base64');
}

export function decryptString(cipherBase64: string, keyBase64: string): string {
  if (!sodium.ready) {
    throw new Error('Sodium not initialized. Call initSodium() first.');
  }

  const key = Buffer.from(keyBase64, 'base64');
  const buf = Buffer.from(cipherBase64, 'base64');

  const nonce = buf.slice(0, sodium.crypto_secretbox_NONCEBYTES);
  const cipher = buf.slice(sodium.crypto_secretbox_NONCEBYTES);

  // Faz o type casting explícito
  const plainBytes = sodium.crypto_secretbox_open_easy(
    cipher as Uint8Array,
    nonce as Uint8Array,
    key as Uint8Array
  );

  // Converte de volta para string
  return sodium.to_string(plainBytes as Uint8Array);
}
