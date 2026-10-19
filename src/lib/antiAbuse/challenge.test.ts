import { solveChallenge } from "altcha-lib";
import { deriveKey } from "altcha-lib/algorithms/web/pbkdf2";
import { describe, expect, it } from "vitest";

import { challengePayloadSchema, createSessionChallenge, isSolvedChallenge } from "./challenge";

const secrets = { signatureSecret: "sig", keySignatureSecret: "key" };

async function solve(now = Date.now()) {
  const challenge = await createSessionChallenge(secrets, now);
  const solution = await solveChallenge({ challenge, deriveKey });
  if (!solution) {
    throw new Error("unsolved");
  }
  return challengePayloadSchema.parse(JSON.parse(JSON.stringify({ challenge, solution })));
}

describe("session challenge", () => {
  it("verifies a genuinely solved challenge", async () => {
    expect(await isSolvedChallenge(secrets, await solve())).toBe(true);
  });

  it("rejects a forged derived key", async () => {
    const payload = await solve();
    const derivedKey = payload.solution.derivedKey.replace(/^./, (c) => (c === "0" ? "1" : "0"));
    const forged = { ...payload, solution: { ...payload.solution, derivedKey } };
    expect(await isSolvedChallenge(secrets, forged)).toBe(false);
  });

  it("rejects a challenge signed with another secret", async () => {
    const payload = await solve();
    expect(await isSolvedChallenge({ ...secrets, signatureSecret: "other" }, payload)).toBe(false);
  });

  it("rejects an expired challenge", async () => {
    const payload = await solve(Date.now() - 60 * 60 * 1000);
    expect(await isSolvedChallenge(secrets, payload)).toBe(false);
  });
});
