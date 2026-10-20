import { z } from "zod";

/** At most this many themes in one priority message. */
export const MAX_MESSAGE_THEMES = 3;

/**
 * The priority question is measured like a card (docs/NEUTRALITE.md §6): a new wording or a new
 * set of options takes a new version, and versions are never counted together.
 */
export const priorityQuestion = {
  id: "priorite-message",
  version: 1,
  statement: "Parmi ces thèmes, lesquels voudriez-vous voir traités en priorité ?",
  rationale: "Mesure les priorités que chacun choisit librement, après avoir vu son bilan.",
} as const;

/**
 * Up to 3 themes, or one of the two non-answers the charter always offers (docs/NEUTRALITE.md §4).
 */
export const priorityMessageSchema = z
  .object({
    choice: z.enum(["themes", "dont_know", "prefer_not"]),
    themeIds: z.array(z.string().min(1)).max(MAX_MESSAGE_THEMES).default([]),
  })
  .refine(({ choice, themeIds }) => (choice === "themes" ? themeIds.length > 0 : themeIds.length === 0), {
    message: "Themes only, and at least one, when themes are chosen",
  })
  .refine(({ themeIds }) => new Set(themeIds).size === themeIds.length, {
    message: "Each theme once",
  });

export type PriorityMessage = z.infer<typeof priorityMessageSchema>;

export const priorityMessageRecordSchema = priorityMessageSchema.and(
  z.object({
    sessionId: z.uuid(),
    /** Issued by POST /api/session once the anti-bot challenge is solved. */
    sessionToken: z.string().min(1),
    /** Seed of the random theme order this person saw, to study order effects. */
    displaySeed: z.number().int().nonnegative(),
  }),
);

export type PriorityMessageRecord = z.infer<typeof priorityMessageRecordSchema>;

const MESSAGE_KEY = "requete.message.v1";

/** The message sent from this device, so the summary shows it instead of asking again. */
export function readLocalMessage(): PriorityMessage | null {
  try {
    const raw = window.localStorage.getItem(MESSAGE_KEY);
    const parsed = priorityMessageSchema.safeParse(raw ? JSON.parse(raw) : null);
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

export function saveLocalMessage(message: PriorityMessage): void {
  try {
    window.localStorage.setItem(MESSAGE_KEY, JSON.stringify(message));
  } catch {
    // Blocked storage: the message is still sent, only the reminder is lost.
  }
}

export function clearLocalMessage(): void {
  try {
    window.localStorage.removeItem(MESSAGE_KEY);
  } catch {
    // Nothing stored, nothing to clear.
  }
}
