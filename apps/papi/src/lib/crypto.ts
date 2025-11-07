import sodium from 'libsodium-wrappers';
import crypto from 'crypto';
const ready = sodium.ready;

export async function initSodium() {
  await ready;
}

export const generateSafeId = (prefix = 'id') =>
  `${prefix}_${crypto.randomBytes(8).toString('hex')}`;

export const safeJSON = (data: unknown) => JSON.parse(JSON.stringify(data));
export function encryptString(plain: string, keyBase64: string) {
  const key = Buffer.from(keyBase64, 'base64');
  const nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);
  const cipher = sodium.crypto_secretbox_easy(plain, nonce, key);
  const out = Buffer.concat([Buffer.from(nonce), Buffer.from(cipher)]);
  return Buffer.from(out).toString('base64');
}

export function decryptString(cipherBase64: string, keyBase64: string) {
  const key = Buffer.from(keyBase64, 'base64');
  const buf = Buffer.from(cipherBase64, 'base64');
  const nonce = buf.slice(0, sodium.crypto_secretbox_NONCEBYTES);
  const cipher = buf.slice(sodium.crypto_secretbox_NONCEBYTES);
  const plain = sodium.crypto_secretbox_open_easy(cipher, nonce, key);
  return Buffer.from(plain).toString();
}
