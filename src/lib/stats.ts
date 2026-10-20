import type { Answer } from "@/lib/answers";

/**
 * Below this many answers no share is shown: a percentage on a handful of people means little
 * and could single someone out. Enforced in SQL (supabase/migrations); this copy is for display.
 */
export const MIN_COUNT_FOR_STATS = 100;

/** Full distribution of answers to one card version (docs/NEUTRALITE.md §8). */
export interface AnswerDistribution {
  total: number;
  counts: Record<Answer, number>;
  /** ISO date of the first answer counted. */
  since: string;
}

/** Answers to the current version of the priority question (docs/NEUTRALITE.md §8). */
export interface MessageDistribution {
  /** Every message, including "Je ne sais pas" and "Je préfère ne pas répondre". */
  total: number;
  /** How many messages chose each option: a theme id, "dont_know" or "prefer_not". */
  counts: Record<string, number>;
  since: string;
}

/** Only what passed the threshold; anything absent has too few answers to show. */
export interface SummaryStats {
  /** By card key (`id@version`). */
  cards: Record<string, AnswerDistribution>;
  message: MessageDistribution | null;
}

export const emptyStats: SummaryStats = { cards: {}, message: null };

export function formatShare(count: number, total: number): string {
  return `${total > 0 ? Math.round((count / total) * 100) : 0} %`;
}

export function formatSince(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatCount(count: number): string {
  return count.toLocaleString("fr-FR");
}
