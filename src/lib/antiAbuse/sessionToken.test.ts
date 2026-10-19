import { describe, expect, it } from "vitest";

import { createSessionToken, isValidSessionToken, SESSION_TTL_MS } from "./sessionToken";

const secret = "test-secret";
const sessionId = "3f2b8c1e-6d4a-4c8e-9b1a-2e7f5d9c0a11";
const now = 1_800_000_000_000;

describe("session tokens", () => {
  const token = createSessionToken(secret, sessionId, now);

  it("accepts a token for its own session before expiry", () => {
    expect(isValidSessionToken(secret, sessionId, token, now + 1000)).toBe(true);
  });

  it("rejects an expired token", () => {
    expect(isValidSessionToken(secret, sessionId, token, now + SESSION_TTL_MS + 1)).toBe(false);
  });

  it("rejects a token reused for another session", () => {
    const otherSession = "00000000-0000-4000-8000-000000000000";
    expect(isValidSessionToken(secret, otherSession, token, now)).toBe(false);
  });

  it("rejects a token signed with another secret", () => {
    expect(isValidSessionToken("other-secret", sessionId, token, now)).toBe(false);
  });

  it("rejects a token whose expiry was pushed back", () => {
    const [, signature] = token.split(".");
    const forged = `${now + 10 * SESSION_TTL_MS}.${signature}`;
    expect(isValidSessionToken(secret, sessionId, forged, now)).toBe(false);
  });

  it("rejects malformed tokens", () => {
    expect(isValidSessionToken(secret, sessionId, "garbage", now)).toBe(false);
    expect(isValidSessionToken(secret, sessionId, "", now)).toBe(false);
  });
});
