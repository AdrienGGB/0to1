import { themeFiles } from "../../../content/cards";

import { themeFileSchema, type DeckCard, type ThemeFile } from "./schema";

export function parseThemeFiles(files: unknown[]): ThemeFile[] {
  return files.map((file) => themeFileSchema.parse(file));
}

/** Flattens theme files into deck cards and checks cross-file invariants. */
export function buildDeck(themeFiles: ThemeFile[]): DeckCard[] {
  const cards = themeFiles.flatMap(({ theme, cards }) =>
    cards.map((card) => ({ ...card, theme })),
  );

  const ids = new Set<string>();
  for (const card of cards) {
    if (ids.has(card.id)) {
      throw new Error(`Duplicate card id: ${card.id}`);
    }
    ids.add(card.id);
  }

  for (const card of cards) {
    if (card.mirrorOf && !ids.has(card.mirrorOf)) {
      throw new Error(`Card ${card.id} mirrors unknown card ${card.mirrorOf}`);
    }
  }

  return cards;
}

export function loadDeck(): DeckCard[] {
  return buildDeck(parseThemeFiles(themeFiles));
}
