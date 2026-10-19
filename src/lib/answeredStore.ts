import type { Card } from "@/lib/cards/schema";

/**
 * Remembers on this device which card versions were already answered, so the same person
 * is not shown them again. Stays in the browser: never sent to the server.
 */
const STORAGE_KEY = "requete.answered.v1";

export function getCardKey(card: Pick<Card, "id" | "version">): string {
  return `${card.id}@${card.version}`;
}

export function readAnsweredKeys(): Set<string> {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(parsed) ? parsed.filter((key) => typeof key === "string") : []);
  } catch {
    return new Set();
  }
}

export function markAnswered(card: Pick<Card, "id" | "version">): void {
  try {
    const keys = readAnsweredKeys();
    keys.add(getCardKey(card));
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...keys]));
  } catch {
    // Private mode or blocked storage: the server-side checks still apply.
  }
}

export function filterUnanswered<T extends Pick<Card, "id" | "version">>(
  cards: T[],
  answeredKeys: Set<string>,
): T[] {
  return cards.filter((card) => !answeredKeys.has(getCardKey(card)));
}
