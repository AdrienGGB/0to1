import { getCardKey } from "@/lib/answeredStore";

import type { DeckCard, Theme } from "./schema";

export interface ThemeProgress {
  theme: Theme;
  /** Cards answered on this device: a mirror pair counts once, whichever version was shown. */
  answered: number;
  /** Cards one person can see: one per mirror pair (split-ballot). */
  total: number;
}

function getPairKey(card: DeckCard): string {
  return card.mirrorOf ? [card.id, card.mirrorOf].sort().join("|") : card.id;
}

/**
 * Progress per theme, in alphabetical order so no theme is put forward by the interface
 * (docs/NEUTRALITE.md §5).
 */
export function getThemeProgress(cards: DeckCard[], answeredKeys: Set<string>): ThemeProgress[] {
  const themes = new Map<string, { theme: Theme; pairs: Set<string>; answeredPairs: Set<string> }>();
  for (const card of cards) {
    const entry = themes.get(card.theme.id) ?? {
      theme: card.theme,
      pairs: new Set<string>(),
      answeredPairs: new Set<string>(),
    };
    const pairKey = getPairKey(card);
    entry.pairs.add(pairKey);
    if (answeredKeys.has(getCardKey(card))) {
      entry.answeredPairs.add(pairKey);
    }
    themes.set(card.theme.id, entry);
  }

  return [...themes.values()]
    .map(({ theme, pairs, answeredPairs }) => ({
      theme,
      answered: answeredPairs.size,
      total: pairs.size,
    }))
    .sort((a, b) => a.theme.label.localeCompare(b.theme.label, "fr"));
}

export function isThemeComplete(progress: ThemeProgress): boolean {
  return progress.answered >= progress.total;
}
