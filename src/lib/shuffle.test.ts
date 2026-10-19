import { describe, expect, it } from "vitest";

import { shuffleWithSeed } from "./shuffle";

const items = Array.from({ length: 20 }, (_, i) => i);

describe("shuffleWithSeed", () => {
  it("replays the same order from the same seed", () => {
    expect(shuffleWithSeed(items, 1234)).toEqual(shuffleWithSeed(items, 1234));
  });

  it("produces different orders for different seeds", () => {
    expect(shuffleWithSeed(items, 1)).not.toEqual(shuffleWithSeed(items, 2));
  });

  it("keeps every item exactly once and leaves the input untouched", () => {
    const shuffled = shuffleWithSeed(items, 99);
    expect([...shuffled].sort((a, b) => a - b)).toEqual(items);
    expect(items[0]).toBe(0);
  });
});
