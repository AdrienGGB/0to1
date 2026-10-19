import { challengePayloadSchema, CHALLENGE_TTL_MS, isSolvedChallenge } from "@/lib/antiAbuse/challenge";
import { getClientIp, hashClientKey } from "@/lib/antiAbuse/clientKey";
import {
  consumeChallenge,
  getChallengeSecrets,
  getClientKeySecret,
  getSessionSecret,
  isWithinRateLimit,
} from "@/lib/antiAbuse/server";
import { createSessionToken } from "@/lib/antiAbuse/sessionToken";

// Opens an answering session once the anti-bot challenge is solved.
// The IP is only hashed for rate limiting; it is never stored or linked to answers.
export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  const parsed = challengePayloadSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "invalid_challenge" }, { status: 400 });
  }

  const now = Date.now();
  const clientKey = hashClientKey(getClientKeySecret(), getClientIp(request.headers), new Date(now));
  if (!(await isWithinRateLimit("session", clientKey))) {
    return Response.json({ error: "rate_limited" }, { status: 429 });
  }

  if (!(await isSolvedChallenge(getChallengeSecrets(), parsed.data))) {
    return Response.json({ error: "invalid_challenge" }, { status: 403 });
  }

  const { nonce, expiresAt } = parsed.data.challenge.parameters;
  const expiry = expiresAt ? new Date(expiresAt * 1000) : new Date(now + CHALLENGE_TTL_MS);
  if (!(await consumeChallenge(nonce, expiry))) {
    return Response.json({ error: "challenge_reused" }, { status: 403 });
  }

  const sessionId = crypto.randomUUID();
  return Response.json(
    { sessionId, sessionToken: createSessionToken(getSessionSecret(), sessionId, now) },
    { status: 201 },
  );
}
