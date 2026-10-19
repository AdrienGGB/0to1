import { createChallenge, randomInt, verifySolution, type Challenge } from "altcha-lib";
import { deriveKey } from "altcha-lib/algorithms/web/pbkdf2";
import { z } from "zod";

/**
 * Proof-of-work tuned to take a couple of seconds on a modest phone, solved while the
 * intro screen is read. Costly for a script opening thousands of sessions, invisible to people.
 */
const CHALLENGE_ALGORITHM = "PBKDF2/SHA-256";
const CHALLENGE_COST = 500;
const CHALLENGE_COUNTER_MIN = 1000;
const CHALLENGE_COUNTER_MAX = 2000;
export const CHALLENGE_TTL_MS = 10 * 60 * 1000;

export interface ChallengeSecrets {
  signatureSecret: string;
  keySignatureSecret: string;
}

export function createSessionChallenge(secrets: ChallengeSecrets, now: number): Promise<Challenge> {
  return createChallenge({
    algorithm: CHALLENGE_ALGORITHM,
    cost: CHALLENGE_COST,
    counter: randomInt(CHALLENGE_COUNTER_MIN, CHALLENGE_COUNTER_MAX),
    deriveKey,
    expiresAt: new Date(now + CHALLENGE_TTL_MS),
    hmacSignatureSecret: secrets.signatureSecret,
    hmacKeySignatureSecret: secrets.keySignatureSecret,
  });
}

export const challengePayloadSchema = z.object({
  challenge: z.object({
    parameters: z
      .object({
        algorithm: z.string(),
        nonce: z.string().min(1),
        salt: z.string(),
        cost: z.number(),
        keyLength: z.number(),
        keyPrefix: z.string(),
        keySignature: z.string().optional(),
        expiresAt: z.number().optional(),
      })
      .loose(),
    signature: z.string().optional(),
  }),
  solution: z.object({
    counter: z.number().int().nonnegative(),
    derivedKey: z.string(),
    time: z.number().optional(),
  }),
});

export type ChallengePayload = z.infer<typeof challengePayloadSchema>;

export async function isSolvedChallenge(
  secrets: ChallengeSecrets,
  payload: ChallengePayload,
): Promise<boolean> {
  const result = await verifySolution({
    challenge: payload.challenge,
    solution: payload.solution,
    deriveKey,
    hmacSignatureSecret: secrets.signatureSecret,
    hmacKeySignatureSecret: secrets.keySignatureSecret,
  });
  return result.verified;
}
