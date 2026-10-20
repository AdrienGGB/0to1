"use client";

import { useEffect, useMemo, useState } from "react";
import { LayoutList } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getCardKey, readAnsweredKeys, readLocalAnswers } from "@/lib/answeredStore";
import { answerLabels, answerSchema, type Answer } from "@/lib/answers";
import type { DeckCard, Theme } from "@/lib/cards/schema";
import {
  MAX_MESSAGE_THEMES,
  priorityQuestion,
  readLocalMessage,
  saveLocalMessage,
  type PriorityMessage,
} from "@/lib/priorityMessage";
import { createSeed, shuffleWithSeed } from "@/lib/shuffle";
import type { AnswerSession } from "@/lib/startSession";
import {
  emptyStats,
  formatCount,
  formatShare,
  formatSince,
  MIN_COUNT_FOR_STATS,
  type AnswerDistribution,
  type SummaryStats,
} from "@/lib/stats";
import { buildSummary } from "@/lib/summary";

// Wording reviewed against docs/NEUTRALITE.md: it mirrors answers, never interprets or rates them.
export const summaryText = {
  title: "Votre bilan",
  intro:
    "Ce bilan est calculé sur cet appareil à partir de vos réponses ; il ne vous classe pas. Vos réponses, anonymes, sont aussi enregistrées avec celles des autres participants.",
  prioritiesTitle: "Les thèmes qui comptent pour vous",
  prioritiesEmpty: "Vous n'avez pas encore répondu aux cartes sur l'importance des thèmes.",
  needsTitle: "Vos réponses qui peuvent indiquer une difficulté ou une préoccupation",
  needsEmpty:
    "Aucune de vos réponses ne correspond à une difficulté ou une préoccupation parmi les cartes concernées.",
  notEnough: `Pas encore assez de réponses pour comparer (il en faut au moins ${MIN_COUNT_FOR_STATS}).`,
  notRepresentative:
    "Les participants ne forment pas un échantillon représentatif de la population. Les comparaisons comptent toutes les réponses, y compris celles données en choisissant un thème.",
  messageTitle: "Votre message",
  messageHint: `Choisissez de 1 à ${MAX_MESSAGE_THEMES} thèmes.`,
  messageSent: "Vos choix sont enregistrés, de façon anonyme, avec ceux des autres participants",
  messageMultiple: `Chaque personne peut choisir jusqu'à ${MAX_MESSAGE_THEMES} thèmes : le total dépasse 100\u00a0%.`,
  messageNotEnough: `Pas encore assez de réponses à cette question pour comparer (il en faut au moins ${MIN_COUNT_FOR_STATS}).`,
  messageError: "Vos choix n'ont pas pu être envoyés. Vérifiez votre connexion et réessayez.",
  clearConfirm:
    "Ce bilan et la liste des cartes répondues seront effacés de cet appareil. Les réponses déjà envoyées restent enregistrées, anonymes, sur le serveur.",
};

const answerOrder = answerSchema.options;

function sendMessage(
  session: AnswerSession,
  message: PriorityMessage,
  displaySeed: number,
): Promise<Response> {
  return fetch("/api/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...message, ...session, displaySeed }),
  });
}

function MessageDistributionList({
  themes,
  chosen,
  stats,
}: {
  themes: Theme[];
  chosen: string[];
  stats: SummaryStats | null;
}) {
  const distribution = stats?.message;
  if (!distribution) {
    return (
      <p className="text-sm text-muted-foreground">
        {stats === null ? "Chargement des autres réponses…" : summaryText.messageNotEnough}
      </p>
    );
  }
  const share = (option: string) => formatShare(distribution.counts[option] ?? 0, distribution.total);
  // Every option in one shared, alphabetical layout, non-answers last (docs/NEUTRALITE.md §8).
  const allOptions = [
    ...[...themes].sort((a, b) => a.label.localeCompare(b.label, "fr")).map((theme) => ({
      id: theme.id,
      label: theme.label,
    })),
    { id: "dont_know", label: answerLabels.dont_know },
    { id: "prefer_not", label: answerLabels.prefer_not },
  ];
  return (
    <div className="flex flex-col gap-2 text-sm">
      <p className="text-muted-foreground">
        Sur cette question, {formatCount(distribution.total)} réponses depuis le{" "}
        {formatSince(distribution.since)}. {summaryText.messageMultiple}
      </p>
      {chosen.length > 0 && (
        <ul className="flex flex-col gap-1">
          {allOptions
            .filter((option) => chosen.includes(option.id))
            .map((option) => (
              <li key={option.id}>
                <span className="font-medium">{option.label}</span> : choisi dans {share(option.id)} des
                réponses à cette question
              </li>
            ))}
        </ul>
      )}
      <details>
        <summary className="cursor-pointer underline underline-offset-4">Voir tous les thèmes</summary>
        <ul className="mt-2 flex flex-col gap-1">
          {allOptions.map((option) => (
            <li key={option.id} className={chosen.includes(option.id) ? "font-semibold" : undefined}>
              {option.label} : {share(option.id)}
            </li>
          ))}
        </ul>
      </details>
    </div>
  );
}

function Distribution({
  distribution,
  answer,
  isLoading,
}: {
  distribution: AnswerDistribution | undefined;
  answer: Answer;
  isLoading: boolean;
}) {
  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Chargement des autres réponses…</p>;
  }
  if (!distribution) {
    return <p className="text-sm text-muted-foreground">{summaryText.notEnough}</p>;
  }
  // Full distribution, "Je ne sais pas" included, with count and period (docs/NEUTRALITE.md §8).
  return (
    <div className="flex flex-col gap-1 text-sm">
      <p className="text-muted-foreground">
        Sur cette carte, {formatCount(distribution.total)} réponses depuis le{" "}
        {formatSince(distribution.since)} :
      </p>
      <ul className="flex flex-wrap gap-x-4 gap-y-1">
        {answerOrder.map((value) => (
          <li key={value} className={value === answer ? "font-semibold" : undefined}>
            {answerLabels[value]} {formatShare(distribution.counts[value], distribution.total)}
          </li>
        ))}
      </ul>
    </div>
  );
}

function PriorityMessageForm({
  themes,
  session,
  stats,
}: {
  themes: Theme[];
  session: AnswerSession | null;
  stats: SummaryStats | null;
}) {
  const [sent, setSent] = useState<PriorityMessage | null>(() => readLocalMessage());
  const [selected, setSelected] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
  // A non-ordinal list: random order per person, recorded with the answer (docs/NEUTRALITE.md §4).
  const [displaySeed] = useState(() => createSeed());
  const orderedThemes = useMemo(() => shuffleWithSeed(themes, displaySeed), [themes, displaySeed]);

  async function submit(message: PriorityMessage) {
    if (!session) {
      return;
    }
    setStatus("sending");
    try {
      const response = await sendMessage(session, message, displaySeed);
      // 409: this session already sent one; the first is kept, so show it as sent.
      if (!response.ok && response.status !== 409) {
        throw new Error(`HTTP ${response.status}`);
      }
      saveLocalMessage(message);
      setSent(message);
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  }

  function toggle(themeId: string) {
    setSelected((current) =>
      current.includes(themeId) ? current.filter((id) => id !== themeId) : [...current, themeId],
    );
  }

  if (sent) {
    const chosenLabels =
      sent.choice === "themes"
        ? themes.filter((theme) => sent.themeIds.includes(theme.id)).map((theme) => theme.label)
        : [answerLabels[sent.choice]];
    return (
      <div className="flex flex-col gap-3" aria-live="polite">
        <p>
          {summaryText.messageSent} : {chosenLabels.join(", ")}.
        </p>
        <MessageDistributionList
          themes={themes}
          chosen={sent.choice === "themes" ? sent.themeIds : [sent.choice]}
          stats={stats}
        />
      </div>
    );
  }

  const isFull = selected.length >= MAX_MESSAGE_THEMES;
  return (
    <div className="flex flex-col gap-3">
      <p id="message-question">{priorityQuestion.statement}</p>
      <p className="text-sm text-muted-foreground" id="message-hint">
        {summaryText.messageHint}
      </p>
      {/* Random order per person and one shared style: no theme is put forward. */}
      <ul
        className="flex flex-wrap gap-2"
        aria-labelledby="message-question"
        aria-describedby="message-hint"
      >
        {orderedThemes.map((theme) => {
          const isSelected = selected.includes(theme.id);
          return (
            <li key={theme.id}>
              <Button
                variant={isSelected ? "default" : "outline"}
                size="sm"
                aria-pressed={isSelected}
                disabled={!isSelected && isFull}
                onClick={() => toggle(theme.id)}
              >
                {theme.label}
              </Button>
            </li>
          );
        })}
      </ul>
      {status === "error" && (
        <p role="alert" className="text-sm">
          {summaryText.messageError}
        </p>
      )}
      <div className="flex flex-col gap-2">
        <Button
          size="lg"
          disabled={selected.length === 0 || !session || status === "sending"}
          onClick={() => submit({ choice: "themes", themeIds: selected })}
        >
          {status === "sending" ? "Envoi…" : "Envoyer mes choix"}
        </Button>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="ghost"
            disabled={!session || status === "sending"}
            onClick={() => submit({ choice: "dont_know", themeIds: [] })}
          >
            {answerLabels.dont_know}
          </Button>
          <Button
            variant="ghost"
            className="whitespace-normal"
            disabled={!session || status === "sending"}
            onClick={() => submit({ choice: "prefer_not", themeIds: [] })}
          >
            {answerLabels.prefer_not}
          </Button>
        </div>
      </div>
    </div>
  );
}

interface SurveySummaryProps {
  cards: DeckCard[];
  session: AnswerSession | null;
  hasMoreCards: boolean;
  onContinue: () => void;
  onShowMenu: () => void;
  onClear: () => void;
}

export function SurveySummary({
  cards,
  session,
  hasMoreCards,
  onContinue,
  onShowMenu,
  onClear,
}: SurveySummaryProps) {
  const [summary] = useState(() => buildSummary(cards, readLocalAnswers(), readAnsweredKeys()));
  const [stats, setStats] = useState<SummaryStats | null>(null);
  const [isConfirmingClear, setIsConfirmingClear] = useState(false);

  const themes = useMemo(
    () =>
      [...new Map(cards.map((card) => [card.theme.id, card.theme])).values()].sort((a, b) =>
        a.label.localeCompare(b.label, "fr"),
      ),
    [cards],
  );

  useEffect(() => {
    fetch("/api/stats")
      .then((response) => (response.ok ? (response.json() as Promise<SummaryStats>) : emptyStats))
      .then(setStats)
      .catch(() => setStats(emptyStats));
  }, []);

  return (
    <section className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold">{summaryText.title}</h1>
        <p className="text-muted-foreground">
          {summary.answeredCount > 1
            ? `Vous avez répondu à ${summary.answeredCount} cartes. `
            : `Vous avez répondu à ${summary.answeredCount} carte. `}
          {summaryText.intro}
        </p>
      </div>

      <section className="flex flex-col gap-3" aria-labelledby="summary-priorities">
        <h2 id="summary-priorities" className="text-lg font-semibold">
          {summaryText.prioritiesTitle}
        </h2>
        {summary.priorityThemes.length > 0 ? (
          <ul className="flex flex-wrap gap-2">
            {summary.priorityThemes.map((theme) => (
              <li key={theme.id} className="rounded-full border px-3 py-1 text-sm">
                {theme.label}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground">{summaryText.prioritiesEmpty}</p>
        )}
      </section>

      <section className="flex flex-col gap-3" aria-labelledby="summary-needs">
        <h2 id="summary-needs" className="text-lg font-semibold">
          {summaryText.needsTitle}
        </h2>
        {summary.reportedNeeds.length > 0 ? (
          <ul className="flex flex-col gap-3">
            {summary.reportedNeeds.map(({ card, answer, label }) => (
              <li key={card.id} className="flex flex-col gap-2 rounded-xl border p-4">
                <p className="font-medium">{label}</p>
                <p className="text-sm text-muted-foreground">
                  Votre réponse à «&nbsp;{card.statement}&nbsp;» :{" "}
                  <span className="font-semibold text-foreground">{answerLabels[answer]}</span>
                </p>
                <Distribution
                  distribution={stats?.cards[getCardKey(card)]}
                  answer={answer}
                  isLoading={stats === null}
                />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground">{summaryText.needsEmpty}</p>
        )}
        <p className="text-xs text-muted-foreground">{summaryText.notRepresentative}</p>
      </section>

      <section className="flex flex-col gap-3" aria-labelledby="summary-message">
        <h2 id="summary-message" className="text-lg font-semibold">
          {summaryText.messageTitle}
        </h2>
        <PriorityMessageForm themes={themes} session={session} stats={stats} />
      </section>

      <div className="flex flex-col gap-2">
        {hasMoreCards && (
          <Button size="lg" variant="outline" onClick={onContinue}>
            Continuer avec d&apos;autres cartes
          </Button>
        )}
        <Button size="lg" variant="outline" onClick={onShowMenu}>
          <LayoutList aria-hidden /> Choisir un thème
        </Button>
        {summary.untouchedThemes.length > 0 && (
          <p className="text-center text-sm text-muted-foreground">
            {summary.untouchedThemes.length > 1
              ? `${summary.untouchedThemes.length} thèmes pas encore abordés.`
              : "1 thème pas encore abordé."}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2 border-t pt-6">
        {isConfirmingClear ? (
          <>
            <p className="text-sm text-muted-foreground">{summaryText.clearConfirm}</p>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={onClear}>
                Effacer
              </Button>
              <Button variant="ghost" onClick={() => setIsConfirmingClear(false)}>
                Annuler
              </Button>
            </div>
          </>
        ) : (
          <Button variant="ghost" onClick={() => setIsConfirmingClear(true)}>
            Effacer mes réponses de cet appareil
          </Button>
        )}
      </div>
    </section>
  );
}
