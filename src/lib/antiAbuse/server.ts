import "server-only";

import { createHmac } from "node:crypto";

import { createAnonServerClient } from "@/lib/supabase/server";

import type { ChallengeSecrets } from "./challenge";

const DEV_SECRET = "dev-only-insecure-secret";

/** One root secret; each use gets its own derived key so they never collide. */
function deriveSecret(purpose: string): string {
  const root = process.env.ANTI_ABUSE_SECRET;
  if (!root && process.env.NODE_ENV === "production") {
    throw new Error("ANTI_ABUSE_SECRET is not set");
  }
  return createHmac("sha256", root ?? DEV_SECRET).update(purpose).digest("base64url");
}

export function getChallengeSecrets(): ChallengeSecrets {
  return {
    signatureSecret: deriveSecret("altcha-signature"),
    keySignatureSecret: deriveSecret("altcha-key-signature"),
  };
}

export function getSessionSecret(): string {
  return deriveSecret("session-token");
}

export function getClientKeySecret(): string {
  return deriveSecret("client-key");
}

export type RateLimitScope = "session" | "answer" | "message";

/**
 * Generous limits: many people can share one IP (mobile carriers, schools, offices).
 * They stop floods, not households.
 */
const rateLimits: Record<RateLimitScope, { windowSeconds: number; limit: number }> = {
  session: { windowSeconds: 3600, limit: 60 },
  answer: { windowSeconds: 3600, limit: 2000 },
  message: { windowSeconds: 3600, limit: 60 },
};

// In-memory fallbacks for local dev without Supabase. Not shared across serverless instances.
const memoryHits = new Map<string, number>();
const memoryUsedNonces = new Set<string>();

export async function isWithinRateLimit(scope: RateLimitScope, clientKey: string): Promise<boolean> {
  const { windowSeconds, limit } = rateLimits[scope];
  const supabase = createAnonServerClient();
  if (!supabase) {
    const window = Math.floor(Date.now() / 1000 / windowSeconds);
    const key = `${scope}:${clientKey}:${window}`;
    const hits = (memoryHits.get(key) ?? 0) + 1;
    memoryHits.set(key, hits);
    return hits <= limit;
  }
  const { data, error } = await supabase.rpc("hit_rate_limit", {
    p_key: clientKey,
    p_scope: scope,
    p_window_seconds: windowSeconds,
    p_limit: limit,
  });
  // Fail open: losing an answer is worse than letting a few extra through.
  return error ? true : data;
}

/** Records a challenge as spent; false when it was already used (replay). */
export async function consumeChallenge(nonce: string, expiresAt: Date): Promise<boolean> {
  const supabase = createAnonServerClient();
  if (!supabase) {
    if (memoryUsedNonces.has(nonce)) {
      return false;
    }
    memoryUsedNonces.add(nonce);
    return true;
  }
  const { data, error } = await supabase.rpc("consume_challenge", {
    p_nonce: nonce,
    p_expires_at: expiresAt.toISOString(),
  });
  // Fail open, like the rate limit: an outage must not lock everyone out.
  return error ? true : data;
}
