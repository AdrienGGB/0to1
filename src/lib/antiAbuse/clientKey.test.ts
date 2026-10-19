import { describe, expect, it } from "vitest";

import { getClientIp, hashClientKey } from "./clientKey";

const day1 = new Date("2026-10-19T08:00:00Z");
const day1Later = new Date("2026-10-19T23:59:00Z");
const day2 = new Date("2026-10-20T00:01:00Z");

describe("hashClientKey", () => {
  it("gives the same key for the same IP on the same day", () => {
    expect(hashClientKey("s", "203.0.113.7", day1)).toBe(hashClientKey("s", "203.0.113.7", day1Later));
  });

  it("cannot be linked across days", () => {
    expect(hashClientKey("s", "203.0.113.7", day1)).not.toBe(hashClientKey("s", "203.0.113.7", day2));
  });

  it("never contains the IP itself", () => {
    expect(hashClientKey("s", "203.0.113.7", day1)).not.toContain("203.0.113.7");
  });
});

describe("getClientIp", () => {
  it("takes the first address of x-forwarded-for", () => {
    const headers = new Headers({ "x-forwarded-for": "203.0.113.7, 10.0.0.1" });
    expect(getClientIp(headers)).toBe("203.0.113.7");
  });

  it("falls back to x-real-ip, then to a constant", () => {
    expect(getClientIp(new Headers({ "x-real-ip": "198.51.100.2" }))).toBe("198.51.100.2");
    expect(getClientIp(new Headers())).toBe("unknown");
  });
});
