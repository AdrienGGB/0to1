import { describe, expect, it } from "vitest";

import { getCardKey } from "@/lib/answeredStore";

import { buildSessionDeck } from "./buildSessionDeck";
import { loadDeck } from "./loadCards";
import { getThemeProgress, isThemeComplete } from "./themeProgress";

const allCards = loadDeck();

describe("getThemeProgress", () => {
  it("lists every theme once, in alphabetical order", () => {
    const labels = getThemeProgress(allCards, new Set()).map(({ theme }) => theme.label);
    expect(new Set(labels).size).toBe(new Set(allCards.map((card) => card.theme.id)).size);
    expect(labels).toEqual([...labels].sort((a, b) => a.localeCompare(b, "fr")));
  });

  it("counts one card per mirror pair", () => {
    const total = getThemeProgress(allCards, new Set()).reduce((sum, { total }) => sum + total, 0);
    expect(total).toBe(buildSessionDeck(allCards, new Set(), 1, 1000).length);
  });

  it("counts a pair as answered whichever version was shown", () => {
    const card = allCards.find((candidate) => candidate.mirrorOf)!;
    const mirror = allCards.find((candidate) => candidate.id === card.mirrorOf)!;
    for (const shown of [card, mirror]) {
      const progress = getThemeProgress(allCards, new Set([getCardKey(shown)]));
      expect(progress.find(({ theme }) => theme.id === card.theme.id)?.answered).toBe(1);
    }
  });

  it("ignores answers to an older version of a card", () => {
    const card = allCards[0];
    const progress = getThemeProgress(allCards, new Set([`${card.id}@${card.version + 1}`]));
    expect(progress.every(({ answered }) => answered === 0)).toBe(true);
  });

  it("marks a theme complete once its whole deck is answered", () => {
    const themeId = allCards[0].theme.id;
    const themeCards = allCards.filter((card) => card.theme.id === themeId);
    const answered = new Set(buildSessionDeck(themeCards, new Set(), 3, 1000).map(getCardKey));
    const progress = getThemeProgress(allCards, answered).find(({ theme }) => theme.id === themeId)!;
    expect(isThemeComplete(progress)).toBe(true);
  });
});
