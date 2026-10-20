import { getCardKey } from "@/lib/answeredStore";
import type { Answer } from "@/lib/answers";
import type { DeckCard, Theme } from "@/lib/cards/schema";

export interface ReportedNeed {
  card: DeckCard;
  answer: Answer;
  label: string;
}

/**
 * The person's own answers, regrouped. Mirrors what they said, never interprets it:
 * no score, no profile, no ranking between themes (docs/NEUTRALITE.md §1 and §9).
 */
export interface Summary {
  answeredCount: number;
  /** Themes the person said matter a lot to them, in alphabetical order. */
  priorityThemes: Theme[];
  /** Difficulties or concerns the person reported, by theme then label, alphabetically. */
  reportedNeeds: ReportedNeed[];
  /** Themes with no card answered on this device yet. */
  untouchedThemes: Theme[];
}

const byLabel = (a: string, b: string) => a.localeCompare(b, "fr");

export function buildSummary(
  cards: DeckCard[],
  localAnswers: Map<string, Answer>,
  answeredKeys: Set<string>,
): Summary {
  const priorityThemes = new Map<string, Theme>();
  const reportedNeeds: ReportedNeed[] = [];
  const touchedThemes = new Set<string>();
  let answeredCount = 0;

  for (const card of cards) {
    const key = getCardKey(card);
    if (answeredKeys.has(key)) {
      answeredCount++;
      touchedThemes.add(card.theme.id);
    }
    const answer = localAnswers.get(key);
    if (!answer || !card.signal || answer !== card.signal.answer) {
      continue;
    }
    if (card.signal.kind === "priority") {
      priorityThemes.set(card.theme.id, card.theme);
    } else {
      reportedNeeds.push({ card, answer, label: card.signal.label });
    }
  }

  const themes = new Map(cards.map((card) => [card.theme.id, card.theme]));
  return {
    answeredCount,
    priorityThemes: [...priorityThemes.values()].sort((a, b) => byLabel(a.label, b.label)),
    reportedNeeds: reportedNeeds.sort(
      (a, b) => byLabel(a.card.theme.label, b.card.theme.label) || byLabel(a.label, b.label),
    ),
    untouchedThemes: [...themes.values()]
      .filter((theme) => !touchedThemes.has(theme.id))
      .sort((a, b) => byLabel(a.label, b.label)),
  };
}
