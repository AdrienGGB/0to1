import type { Answer } from "@/lib/answers";
import type { Card } from "@/lib/cards/schema";

/**
 * Remembers on this device which card versions were already answered, so the same person
 * is not shown them again, and what they answered, for their own summary. Stays in the
 * browser: never sent to the server from here.
 */
const STORAGE_KEY = "requete.answered.v1";
const ANSWERS_KEY = "requete.answers.v1";

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

const answerValues: readonly string[] = ["yes", "no", "dont_know", "prefer_not"];

/** Answers given on this device, by card key. Cards answered before answers were kept are absent. */
export function readLocalAnswers(): Map<string, Answer> {
  try {
    const raw = window.localStorage.getItem(ANSWERS_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : {};
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return new Map();
    }
    return new Map(
      Object.entries(parsed).filter((entry): entry is [string, Answer] =>
        answerValues.includes(entry[1] as string),
      ),
    );
  } catch {
    return new Map();
  }
}

export function markAnswered(card: Pick<Card, "id" | "version">, answer: Answer): void {
  try {
    const keys = readAnsweredKeys();
    keys.add(getCardKey(card));
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...keys]));
    const answers = readLocalAnswers();
    answers.set(getCardKey(card), answer);
    window.localStorage.setItem(ANSWERS_KEY, JSON.stringify(Object.fromEntries(answers)));
  } catch {
    // Private mode or blocked storage: the server-side checks still apply.
  }
}

/** Forgets everything this device remembers. Answers already sent stay, anonymous, on the server. */
export function clearLocalAnswers(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    window.localStorage.removeItem(ANSWERS_KEY);
  } catch {
    // Nothing stored, nothing to clear.
  }
}

export function filterUnanswered<T extends Pick<Card, "id" | "version">>(
  cards: T[],
  answeredKeys: Set<string>,
): T[] {
  return cards.filter((card) => !answeredKeys.has(getCardKey(card)));
}
