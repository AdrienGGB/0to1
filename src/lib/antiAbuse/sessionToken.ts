import { createHmac, timingSafeEqual } from "node:crypto";

/** A session lasts long enough for a full deck, short enough to limit token reuse. */
export const SESSION_TTL_MS = 2 * 60 * 60 * 1000;

function sign(secret: string, sessionId: string, expiresAt: number): string {
  return createHmac("sha256", secret).update(`${sessionId}.${expiresAt}`).digest("base64url");
}

/** Stateless token proving the server opened this session after a solved challenge. */
export function createSessionToken(secret: string, sessionId: string, now: number): string {
  const expiresAt = now + SESSION_TTL_MS;
  return `${expiresAt}.${sign(secret, sessionId, expiresAt)}`;
}

export function isValidSessionToken(
  secret: string,
  sessionId: string,
  token: string,
  now: number,
): boolean {
  const [expiresAtRaw, signature] = token.split(".");
  const expiresAt = Number(expiresAtRaw);
  if (!signature || !Number.isSafeInteger(expiresAt) || expiresAt < now) {
    return false;
  }
  const expected = Buffer.from(sign(secret, sessionId, expiresAt));
  const actual = Buffer.from(signature);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
