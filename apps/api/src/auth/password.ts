import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

const scrypt = promisify(scryptCallback);

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  return `${salt}:${derived.toString('hex')}`;
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const [salt, hexHash] = storedHash.split(':');
  if (!salt || !hexHash) {
    return false;
  }

  const hashedBuffer = Buffer.from(hexHash, 'hex');
  const candidate = (await scrypt(password, salt, 64)) as Buffer;

  if (hashedBuffer.length !== candidate.length) {
    return false;
  }

  return timingSafeEqual(hashedBuffer, candidate);
}
