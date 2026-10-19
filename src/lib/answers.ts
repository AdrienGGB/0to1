import { z } from "zod";

export const answerSchema = z.enum(["yes", "no", "dont_know", "prefer_not"]);
export type Answer = z.infer<typeof answerSchema>;

export type SwipeDirection = "left" | "right" | "up" | "down";

const answerByDirection: Record<SwipeDirection, Answer> = {
  right: "yes",
  left: "no",
  up: "dont_know",
  down: "prefer_not",
};

export const answerLabels: Record<Answer, string> = {
  yes: "Oui",
  no: "Non",
  dont_know: "Je ne sais pas",
  prefer_not: "Je préfère ne pas répondre",
};

export function getAnswerForDirection(direction: SwipeDirection): Answer {
  return answerByDirection[direction];
}

export function getDirectionForAnswer(answer: Answer): SwipeDirection {
  const entry = Object.entries(answerByDirection).find(
    ([, value]) => value === answer,
  );
  if (!entry) {
    throw new Error(`No direction for answer ${answer}`);
  }
  return entry[0] as SwipeDirection;
}

/** Below this delay a card was most likely not read; the answer is flagged, not rejected. */
export const FAST_ANSWER_MS = 1000;

export function isFastAnswer(responseMs: number): boolean {
  return responseMs < FAST_ANSWER_MS;
}

export const SWIPE_DISTANCE_PX = 100;
export const SWIPE_VELOCITY_PX_S = 500;

interface Vector {
  x: number;
  y: number;
}

/** Resolves a drag gesture to a direction, or null when it should snap back. */
export function getSwipeDirection(
  offset: Vector,
  velocity: Vector,
): SwipeDirection | null {
  const isHorizontal = Math.abs(offset.x) >= Math.abs(offset.y);
  const distance = isHorizontal ? offset.x : offset.y;
  const speed = isHorizontal ? velocity.x : velocity.y;

  const isFarEnough = Math.abs(distance) >= SWIPE_DISTANCE_PX;
  const isFastEnough =
    Math.abs(speed) >= SWIPE_VELOCITY_PX_S && Math.sign(speed) === Math.sign(distance);

  if (!isFarEnough && !isFastEnough) {
    return null;
  }
  if (isHorizontal) {
    return distance > 0 ? "right" : "left";
  }
  return distance > 0 ? "down" : "up";
}

/**
 * How the deck was built: themes interleaved at random, or one theme the person picked.
 * Theme answers are self-selected, so analysis keeps the two apart.
 */
export const deckModeSchema = z.enum(["mixed", "theme"]);
export type DeckMode = z.infer<typeof deckModeSchema>;

export const answerRecordSchema = z.object({
  sessionId: z.uuid(),
  /** Issued by POST /api/session once the anti-bot challenge is solved. */
  sessionToken: z.string().min(1),
  cardId: z.string().min(1),
  cardVersion: z.number().int().positive(),
  answer: answerSchema,
  /** 0-based position of the card in this session's shuffled deck. */
  position: z.number().int().nonnegative(),
  deckSeed: z.number().int().nonnegative(),
  responseMs: z.number().int().nonnegative(),
  isFast: z.boolean(),
  /** Defaults to "mixed" for pages loaded before theme choice existed. */
  deckMode: deckModeSchema.default("mixed"),
});

export type AnswerRecord = z.infer<typeof answerRecordSchema>;
