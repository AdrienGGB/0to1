import { z } from "zod";

/**
 * Card kinds, from least to most leading (see docs/NEUTRALITE.md §2).
 * Prefer the earliest kind that measures the need a card targets.
 */
export const cardKindSchema = z.enum([
  "experience",
  "perception",
  "priority",
  "expectation",
  "solution",
]);

export const reviewSchema = z.object({
  date: z.iso.date(),
  /** "neutrality-reviewer" for the subagent, a first name for a human reviewer. */
  by: z.string().min(1),
  outcome: z.enum(["approved", "changes_requested", "changes_applied"]),
});

/**
 * Which answer to a card signals a need, for the person's own summary (docs/NEUTRALITE.md §9).
 * Analysis metadata: it never changes what the card shows, so it does not bump the version.
 */
export const signalSchema = z.discriminatedUnion("kind", [
  /** "yes" on « … comptent beaucoup », "no" on its mirror: the theme matters to the person. */
  z.object({ kind: z.literal("priority"), answer: z.enum(["yes", "no"]) }),
  /** A difficulty or concern the person reported, named by a short, side-neutral label. */
  z.object({
    kind: z.literal("difficulty"),
    answer: z.enum(["yes", "no"]),
    label: z.string().min(3).max(60),
  }),
]);

export const cardSchema = z.object({
  /** Stable identifier: never reused, never renamed. */
  id: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
  /** Bumped whenever the statement changes, so answers stay interpretable. */
  version: z.number().int().positive(),
  kind: cardKindSchema,
  statement: z.string().min(10).max(160),
  /** Which need this card measures, in one sentence. */
  rationale: z.string().min(10),
  /** Card framed in the opposite direction, to offset acquiescence bias. */
  mirrorOf: z.string().optional(),
  /** Absent when no answer clearly signals a need (expectations, contested framings). */
  signal: signalSchema.optional(),
  sources: z.array(z.string()).default([]),
  /** Neutrality reviews, oldest first (docs/NEUTRALITE.md §6–7). */
  reviews: z.array(reviewSchema).default([]),
});

export const categorySchema = z.enum([
  "vie-quotidienne",
  "travail-education",
  "environnement",
  "vie-collective",
  "economie",
  "defense",
]);

export const themeSchema = z.object({
  id: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
  label: z.string().min(2),
  category: categorySchema,
});

export const themeFileSchema = z.object({
  theme: themeSchema,
  cards: z.array(cardSchema).min(1),
});

export type CardKind = z.infer<typeof cardKindSchema>;
export type Category = z.infer<typeof categorySchema>;
export type Review = z.infer<typeof reviewSchema>;
export type Signal = z.infer<typeof signalSchema>;
export type Card = z.infer<typeof cardSchema>;
export type Theme = z.infer<typeof themeSchema>;
export type ThemeFile = z.infer<typeof themeFileSchema>;

export interface DeckCard extends Card {
  theme: Theme;
}
