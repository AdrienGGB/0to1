import { describe, expect, it } from "vitest";

import { getCardKey } from "@/lib/answeredStore";

import { buildSessionDeck } from "./buildSessionDeck";
import { loadDeck } from "./loadCards";
import type { DeckCard } from "./schema";

const allCards = loadDeck();
const pairCount = new Set(allCards.map((card) => [card.id, card.mirrorOf].sort().join("|"))).size;

function keysOf(cards: DeckCard[]) {
  return new Set(cards.map(getCardKey));
}

describe("buildSessionDeck", () => {
  it("returns a full deck of distinct cards", () => {
    const deck = buildSessionDeck(allCards, new Set(), 1);
    expect(deck).toHaveLength(12);
    expect(new Set(deck.map((card) => card.id)).size).toBe(12);
  });

  it("never shows both versions of a mirror pair", () => {
    for (let seed = 0; seed < 50; seed++) {
      const ids = new Set(buildSessionDeck(allCards, new Set(), seed, 1000).map((card) => card.id));
      for (const id of ids) {
        const mirrorOf = allCards.find((card) => card.id === id)?.mirrorOf;
        expect(mirrorOf && ids.has(mirrorOf)).toBeFalsy();
      }
    }
  });

  it("draws each version of a pair about half of the time", () => {
    const target = allCards.find((card) => card.mirrorOf)!;
    let shown = 0;
    const runs = 400;
    for (let seed = 0; seed < runs; seed++) {
      if (buildSessionDeck(allCards, new Set(), seed, 1000).some((card) => card.id === target.id)) {
        shown++;
      }
    }
    expect(shown / runs).toBeGreaterThan(0.4);
    expect(shown / runs).toBeLessThan(0.6);
  });

  it("skips answered cards and their mirrors", () => {
    const first = buildSessionDeck(allCards, new Set(), 7);
    const answered = keysOf(first);
    const answeredIds = new Set(first.flatMap((card) => [card.id, card.mirrorOf]));
    const second = buildSessionDeck(allCards, answered, 8);
    expect(second.some((card) => answeredIds.has(card.id))).toBe(false);
  });

  it("runs out once every pair has been answered", () => {
    const answered = new Set<string>();
    let decks = 0;
    for (let deck = buildSessionDeck(allCards, answered, 0); deck.length > 0; decks++) {
      deck.forEach((card) => answered.add(getCardKey(card)));
      deck = buildSessionDeck(allCards, answered, decks + 1);
    }
    expect(answered.size).toBe(pairCount);
    expect(decks).toBe(Math.ceil(pairCount / 12));
  });

  it("mixes themes rather than grouping them", () => {
    const deck = buildSessionDeck(allCards, new Set(), 3);
    expect(new Set(deck.map((card) => card.theme.id)).size).toBe(12);
  });

  it("gives the same deck for the same seed", () => {
    expect(buildSessionDeck(allCards, new Set(), 42)).toEqual(buildSessionDeck(allCards, new Set(), 42));
  });
});
