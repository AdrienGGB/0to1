import { solveChallenge, type Challenge } from "altcha-lib";
import { deriveKey } from "altcha-lib/algorithms/web/pbkdf2";

export interface AnswerSession {
  sessionId: string;
  sessionToken: string;
}

export type ChallengeSolution = Awaited<ReturnType<typeof solveChallenge>>;

export interface SolvedChallenge {
  challenge: Challenge;
  solution: NonNullable<ChallengeSolution>;
}

/** Fetches and solves the anti-bot challenge; meant to run while the intro is being read. */
export async function prepareChallenge(): Promise<SolvedChallenge> {
  const response = await fetch("/api/challenge", { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Challenge request failed: ${response.status}`);
  }
  const challenge = (await response.json()) as Challenge;
  const solution = await solveChallenge({ challenge, deriveKey });
  if (!solution) {
    throw new Error("Challenge could not be solved");
  }
  return { challenge, solution };
}

export async function openSession(solved: SolvedChallenge): Promise<AnswerSession> {
  const response = await fetch("/api/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(solved),
  });
  if (!response.ok) {
    throw new Error(`Session request failed: ${response.status}`);
  }
  return (await response.json()) as AnswerSession;
}
