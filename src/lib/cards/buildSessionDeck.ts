import { getCardKey } from "@/lib/answeredStore";
import { createRandom, shuffleWithSeed } from "@/lib/shuffle";

import type { DeckCard } from "./schema";

/** Short decks keep answering light; people can chain several (docs/NEUTRALITE.md). */
export const DECK_SIZE = 12;

/**
 * Picks the cards for one deck:
 * - skips cards already answered on this device, and the mirror of an answered card;
 * - shows only one version of each mirror pair, drawn at random (split-ballot), so comparing
 *   the two versions across people measures acquiescence without asking anyone twice;
 * - interleaves themes in random order so a deck mixes subjects.
 */
export function buildSessionDeck(
  cards: DeckCard[],
  answeredKeys: Set<string>,
  seed: number,
  size: number = DECK_SIZE,
): DeckCard[] {
  const random = createRandom(seed);
  const byId = new Map(cards.map((card) => [card.id, card]));
  const isAnswered = (card: DeckCard | undefined) => !!card && answeredKeys.has(getCardKey(card));

  const picks: DeckCard[] = [];
  const seen = new Set<string>();
  for (const card of cards) {
    if (seen.has(card.id)) {
      continue;
    }
    const mirror = card.mirrorOf ? byId.get(card.mirrorOf) : undefined;
    seen.add(card.id);
    if (mirror) {
      seen.add(mirror.id);
    }
    if (isAnswered(card) || isAnswered(mirror)) {
      continue;
    }
    picks.push(mirror && random() < 0.5 ? mirror : card);
  }

  const byTheme = new Map<string, DeckCard[]>();
  for (const card of shuffleWithSeed(picks, seed)) {
    byTheme.set(card.theme.id, [...(byTheme.get(card.theme.id) ?? []), card]);
  }
  const themeQueues = shuffleWithSeed([...byTheme.values()], seed + 1);

  const deck: DeckCard[] = [];
  while (deck.length < size && themeQueues.some((queue) => queue.length > 0)) {
    for (const queue of themeQueues) {
      const next = queue.shift();
      if (next && deck.length < size) {
        deck.push(next);
      }
    }
  }
  return deck;
}
