import { createHmac } from "node:crypto";

/**
 * Turns an IP address into a short-lived key for rate limiting. The salt changes every UTC day,
 * so keys from different days cannot be linked, and the IP itself is never stored.
 */
export function hashClientKey(secret: string, ip: string, now: Date): string {
  const day = now.toISOString().slice(0, 10);
  const dailySalt = createHmac("sha256", secret).update(`ip-salt:${day}`).digest();
  return createHmac("sha256", dailySalt).update(ip).digest("base64url");
}

export function getClientIp(headers: Headers): string {
  const forwardedFor = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwardedFor || headers.get("x-real-ip")?.trim() || "unknown";
}
