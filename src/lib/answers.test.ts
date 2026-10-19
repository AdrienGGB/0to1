import { describe, expect, it } from "vitest";

import {
  answerRecordSchema,
  getAnswerForDirection,
  getDirectionForAnswer,
  getSwipeDirection,
  isFastAnswer,
} from "./answers";

const still = { x: 0, y: 0 };

describe("getAnswerForDirection", () => {
  it("maps each direction to its answer", () => {
    expect(getAnswerForDirection("right")).toBe("yes");
    expect(getAnswerForDirection("left")).toBe("no");
    expect(getAnswerForDirection("up")).toBe("dont_know");
    expect(getAnswerForDirection("down")).toBe("prefer_not");
  });

  it("is the inverse of getDirectionForAnswer", () => {
    for (const direction of ["left", "right", "up", "down"] as const) {
      expect(getDirectionForAnswer(getAnswerForDirection(direction))).toBe(direction);
    }
  });
});

describe("getSwipeDirection", () => {
  it("snaps back on a short, slow drag", () => {
    expect(getSwipeDirection({ x: 40, y: 10 }, still)).toBeNull();
  });

  it("resolves a long drag along the dominant axis", () => {
    expect(getSwipeDirection({ x: 150, y: 40 }, still)).toBe("right");
    expect(getSwipeDirection({ x: -150, y: 40 }, still)).toBe("left");
    expect(getSwipeDirection({ x: 30, y: -150 }, still)).toBe("up");
    expect(getSwipeDirection({ x: 30, y: 150 }, still)).toBe("down");
  });

  it("accepts a short flick that is fast enough", () => {
    expect(getSwipeDirection({ x: 30, y: 0 }, { x: 800, y: 0 })).toBe("right");
  });

  it("ignores a flick going against the drag", () => {
    expect(getSwipeDirection({ x: 30, y: 0 }, { x: -800, y: 0 })).toBeNull();
  });
});

describe("isFastAnswer", () => {
  it("flags answers given in under a second", () => {
    expect(isFastAnswer(400)).toBe(true);
    expect(isFastAnswer(1000)).toBe(false);
  });
});

describe("answerRecordSchema", () => {
  const valid = {
    sessionId: "3f2b8c1e-6d4a-4c8e-9b1a-2e7f5d9c0a11",
    sessionToken: "1792430000000.signature",
    cardId: "sante-consultation-delai-ok",
    cardVersion: 1,
    answer: "dont_know",
    position: 0,
    deckSeed: 42,
    responseMs: 2300,
    isFast: false,
  };

  it("accepts a well-formed record", () => {
    expect(answerRecordSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects an unknown answer", () => {
    expect(answerRecordSchema.safeParse({ ...valid, answer: "maybe" }).success).toBe(false);
  });

  it("rejects a non-uuid session id", () => {
    expect(answerRecordSchema.safeParse({ ...valid, sessionId: "abc" }).success).toBe(false);
  });
});
