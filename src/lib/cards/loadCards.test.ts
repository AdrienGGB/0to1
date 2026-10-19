import { describe, expect, it } from "vitest";

import { buildDeck, loadDeck, parseThemeFiles } from "./loadCards";

const theme = { id: "test", label: "Test", category: "economie" };

function makeCard(id: string, mirrorOf?: string) {
  return {
    id,
    version: 1,
    kind: "experience",
    statement: "Une affirmation de test suffisamment longue.",
    rationale: "Une justification de test.",
    mirrorOf,
  };
}

describe("loadDeck", () => {
  it("loads every content file without errors", () => {
    expect(loadDeck().length).toBeGreaterThan(0);
  });

  it("gives every card a mirror (docs/NEUTRALITE.md, format swipe)", () => {
    expect(loadDeck().filter((card) => !card.mirrorOf).map((card) => card.id)).toEqual([]);
  });

  it("only has mirror pairs that point at each other", () => {
    const cards = loadDeck();
    const byId = new Map(cards.map((card) => [card.id, card]));
    for (const card of cards) {
      if (card.mirrorOf) {
        expect(byId.get(card.mirrorOf)?.mirrorOf).toBe(card.id);
      }
    }
  });
});

describe("buildDeck", () => {
  it("rejects duplicate ids across files", () => {
    const files = parseThemeFiles([
      { theme, cards: [makeCard("a")] },
      { theme, cards: [makeCard("a")] },
    ]);
    expect(() => buildDeck(files)).toThrow("Duplicate card id: a");
  });

  it("rejects a mirror pointing at a missing card", () => {
    const files = parseThemeFiles([{ theme, cards: [makeCard("a", "missing")] }]);
    expect(() => buildDeck(files)).toThrow("mirrors unknown card");
  });
});

describe("parseThemeFiles", () => {
  it("rejects a card id that is not kebab-case", () => {
    expect(() => parseThemeFiles([{ theme, cards: [makeCard("Bad Id")] }])).toThrow();
  });
});

describe("content/cards/index.ts", () => {
  it("lists every theme file of the folder", async () => {
    const { readdirSync } = await import("node:fs");
    const files = readdirSync("content/cards").filter((name) => name.endsWith(".json"));
    expect(loadDeck().map((card) => card.theme.id).filter((id, i, all) => all.indexOf(id) === i).length).toBe(
      files.length,
    );
  });
});
