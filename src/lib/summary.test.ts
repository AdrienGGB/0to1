import { describe, expect, it } from "vitest";

import { getCardKey } from "@/lib/answeredStore";
import type { Answer } from "@/lib/answers";
import { loadDeck } from "@/lib/cards/loadCards";
import type { DeckCard } from "@/lib/cards/schema";

import { buildSummary } from "./summary";

const allCards = loadDeck();

function byId(id: string): DeckCard {
  return allCards.find((card) => card.id === id)!;
}

function answered(entries: [string, Answer][]) {
  const answers = new Map(entries.map(([id, answer]) => [getCardKey(byId(id)), answer]));
  return { answers, keys: new Set(answers.keys()) };
}

describe("buildSummary", () => {
  it("lists a theme as mattering from either version of its priority pair", () => {
    const { answers, keys } = answered([
      ["logement-priorite-haute", "yes"],
      ["sante-priorite-basse", "no"],
      ["emploi-priorite-haute", "no"],
      ["defense-priorite-basse", "yes"],
    ]);
    const summary = buildSummary(allCards, answers, keys);
    expect(summary.priorityThemes.map((theme) => theme.id)).toEqual(["logement", "sante"]);
  });

  it("reports a need only for the answer that signals it", () => {
    const { answers, keys } = answered([
      ["logement-cout-difficulte", "yes"],
      ["sante-renoncement-non", "no"],
      ["solidarites-solitude-difficulte", "no"],
      ["pouvoir-achat-imprevu-impossible", "dont_know"],
    ]);
    const summary = buildSummary(allCards, answers, keys);
    expect(summary.reportedNeeds.map((need) => need.label)).toEqual([
      "Coût du logement",
      "Renoncement aux soins pour raisons financières",
    ]);
  });

  it("never reports a non-answer as a need", () => {
    const entries = allCards.flatMap((card): [string, Answer][] => [[card.id, "prefer_not"]]);
    const { answers, keys } = answered(entries);
    const summary = buildSummary(allCards, answers, keys);
    expect(summary.priorityThemes).toEqual([]);
    expect(summary.reportedNeeds).toEqual([]);
  });

  it("counts answered cards and lists untouched themes alphabetically", () => {
    const { answers, keys } = answered([["logement-adapte", "yes"]]);
    keys.add(getCardKey(byId("sante-renoncement-oui")));
    const summary = buildSummary(allCards, answers, keys);
    expect(summary.answeredCount).toBe(2);
    const untouched = summary.untouchedThemes.map((theme) => theme.label);
    expect(untouched).not.toContain("Logement");
    expect(untouched).not.toContain("Santé");
    expect(untouched).toEqual([...untouched].sort((a, b) => a.localeCompare(b, "fr")));
  });

  it("ignores answers kept for an older card version", () => {
    const card = byId("logement-cout-difficulte");
    const stale = `${card.id}@${card.version - 1}`;
    const summary = buildSummary(allCards, new Map([[stale, "yes"]]), new Set([stale]));
    expect(summary.answeredCount).toBe(0);
    expect(summary.reportedNeeds).toEqual([]);
  });
});
