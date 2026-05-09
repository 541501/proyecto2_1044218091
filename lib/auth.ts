import * as jose from 'jose';
import type { JWTPayload } from './types';

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'dev-secret-key-do-not-use-in-production'
);

const ALGORITHM = 'HS256';
const EXPIRATION = '24h';

export async function createToken(payload: JWTPayload): Promise<string> {
  return await new jose.SignJWT(payload)
    .setProtectedHeader({ alg: ALGORITHM })
    .setIssuedAt()
    .setExpirationTime(EXPIRATION)
    .sign(secret);
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const verified = await jose.jwtVerify(token, secret);
    return verified.payload as JWTPayload;
  } catch {
    return null;
  }
}
