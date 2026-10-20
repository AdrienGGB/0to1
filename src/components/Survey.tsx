"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence } from "motion/react";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Check, ClipboardList, LayoutList, Shuffle } from "lucide-react";

import { SurveySummary } from "@/components/SurveySummary";
import { SwipeCard } from "@/components/SwipeCard";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  answerLabels,
  getAnswerForDirection,
  isFastAnswer,
  type AnswerRecord,
  type DeckMode,
  type SwipeDirection,
} from "@/lib/answers";
import { clearLocalAnswers, markAnswered, readAnsweredKeys } from "@/lib/answeredStore";
import { buildSessionDeck } from "@/lib/cards/buildSessionDeck";
import type { DeckCard, Theme } from "@/lib/cards/schema";
import { getThemeProgress, isThemeComplete } from "@/lib/cards/themeProgress";
import { clearLocalMessage } from "@/lib/priorityMessage";
import { createSeed } from "@/lib/shuffle";
import {
  openSession,
  prepareChallenge,
  type AnswerSession,
  type SolvedChallenge,
} from "@/lib/startSession";

type Phase = "intro" | "starting" | "error" | "menu" | "deck" | "done" | "summary";

interface Deck {
  seed: number;
  cards: DeckCard[];
  mode: DeckMode;
  /** The theme the person picked, for a theme deck. */
  theme?: Theme;
}

const keyDirections: Record<string, SwipeDirection> = {
  ArrowLeft: "left",
  ArrowRight: "right",
  ArrowUp: "up",
  ArrowDown: "down",
};

function sendAnswer(record: AnswerRecord) {
  // Fire and forget: a lost answer must never block the person answering.
  fetch("/api/answers", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(record),
    keepalive: true,
  }).catch(() => undefined);
}

interface SurveyProps {
  cards: DeckCard[];
}

export function Survey({ cards }: SurveyProps) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [session, setSession] = useState<AnswerSession | null>(null);
  const [deck, setDeck] = useState<Deck | null>(null);
  const [index, setIndex] = useState(0);
  const [lastDirection, setLastDirection] = useState<SwipeDirection | null>(null);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [answeredKeys, setAnsweredKeys] = useState<Set<string>>(() => new Set());
  const shownAtRef = useRef(0);

  const themeProgress = useMemo(() => getThemeProgress(cards, answeredKeys), [cards, answeredKeys]);
  const answeredTotal = themeProgress.reduce((sum, { answered }) => sum + answered, 0);
  const cardTotal = themeProgress.reduce((sum, { total }) => sum + total, 0);
  const hasMoreCards = answeredTotal < cardTotal;
  const challengeRef = useRef<Promise<SolvedChallenge> | null>(null);

  // Solve the anti-bot challenge in the background while the intro is being read.
  useEffect(() => {
    const pending = prepareChallenge();
    pending.catch(() => undefined);
    challengeRef.current = pending;
  }, []);

  function showMenu() {
    setAnsweredKeys(readAnsweredKeys());
    setPhase("menu");
    window.scrollTo(0, 0);
  }

  function showSummary() {
    setPhase("summary");
    window.scrollTo(0, 0);
  }

  function clearDevice() {
    clearLocalAnswers();
    clearLocalMessage();
    showMenu();
  }

  async function startSurvey() {
    setPhase("starting");
    try {
      const solved = await (challengeRef.current ?? prepareChallenge());
      // The server-issued id groups the answers of one sitting, nothing more.
      setSession(await openSession(solved));
      showMenu();
    } catch {
      // A challenge is single-use: retrying needs a fresh one.
      challengeRef.current = null;
      setPhase("error");
    }
  }

  /** Starts a short deck within the same session: every theme mixed, or the one picked. */
  function startDeck(theme?: Theme) {
    const seed = createSeed();
    const pool = theme ? cards.filter((card) => card.theme.id === theme.id) : cards;
    const deckCards = buildSessionDeck(pool, readAnsweredKeys(), seed);
    if (!session || deckCards.length === 0) {
      return;
    }
    setDeck({ seed, cards: deckCards, mode: theme ? "theme" : "mixed", theme });
    setIndex(0);
    setPhase("deck");
    window.scrollTo(0, 0);
    shownAtRef.current = performance.now();
  }

  const currentCard = deck?.cards[index];

  const handleSwipe = useCallback(
    (direction: SwipeDirection) => {
      if (!session || !deck || !currentCard) {
        return;
      }
      const responseMs = Math.round(performance.now() - shownAtRef.current);
      const answer = getAnswerForDirection(direction);
      sendAnswer({
        sessionId: session.sessionId,
        sessionToken: session.sessionToken,
        cardId: currentCard.id,
        cardVersion: currentCard.version,
        answer,
        position: index,
        deckSeed: deck.seed,
        responseMs,
        isFast: isFastAnswer(responseMs),
        deckMode: deck.mode,
      });

      markAnswered(currentCard, answer);
      setAnsweredCount((count) => count + 1);
      setLastDirection(direction);
      shownAtRef.current = performance.now();
      if (index + 1 >= deck.cards.length) {
        setAnsweredKeys(readAnsweredKeys());
        setPhase("done");
      }
      setIndex(index + 1);
    },
    [session, deck, currentCard, index],
  );

  useEffect(() => {
    if (phase !== "deck") {
      return;
    }
    function handleKeyDown(event: KeyboardEvent) {
      const direction = keyDirections[event.key];
      if (direction) {
        event.preventDefault();
        handleSwipe(direction);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [phase, handleSwipe]);

  if (phase === "intro" || phase === "starting" || phase === "error") {
    return (
      <section className="flex flex-col gap-6">
        <p className="text-sm font-semibold tracking-wide text-muted-foreground">ReQuête</p>
        <h1 className="text-3xl font-semibold text-balance">
          Dites-nous ce dont vous avez besoin
        </h1>
        <div className="flex flex-col gap-3 text-muted-foreground">
          <p>
            Des affirmations s&apos;affichent une par une. Pour chacune, répondez selon votre
            situation, en glissant la carte ou avec les boutons. Il n&apos;y a pas de bonne ou de
            mauvaise réponse.
          </p>
          <p>
            Vos réponses sont anonymes : aucun compte, aucun nom, et votre adresse IP n&apos;est
            jamais enregistrée avec vos réponses. Vous pouvez arrêter à tout moment.
          </p>
        </div>
        <ul className="grid grid-cols-2 gap-2 text-sm">
          <li className="flex items-center gap-2"><ArrowLeft aria-hidden /> {answerLabels.no}</li>
          <li className="flex items-center gap-2"><ArrowRight aria-hidden /> {answerLabels.yes}</li>
          <li className="flex items-center gap-2"><ArrowUp aria-hidden /> {answerLabels.dont_know}</li>
          <li className="flex items-center gap-2"><ArrowDown aria-hidden /> {answerLabels.prefer_not}</li>
        </ul>
        <div className="flex flex-col gap-2">
          {phase === "error" && (
            <p role="alert" className="text-center text-sm">
              Le questionnaire n&apos;a pas pu démarrer. Vérifiez votre connexion et réessayez.
            </p>
          )}
          <Button size="lg" onClick={startSurvey} disabled={phase === "starting"}>
            {phase === "starting"
              ? "Préparation…"
              : phase === "error"
                ? "Réessayer"
                : "J\u2019accepte et je commence"}
          </Button>
          <Link
            href="/confidentialite"
            className="text-center text-sm text-muted-foreground underline underline-offset-4"
          >
            Comment mes réponses sont-elles utilisées ?
          </Link>
        </div>
      </section>
    );
  }

  if (phase === "menu") {
    return (
      <section className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <h1 className="text-2xl font-semibold text-balance">Sur quoi voulez-vous répondre ?</h1>
          <p className="text-sm text-muted-foreground">
            {answeredTotal} {answeredTotal > 1 ? "cartes répondues" : "carte répondue"} sur{" "}
            {cardTotal}
          </p>
          <Progress
            value={cardTotal > 0 ? (answeredTotal / cardTotal) * 100 : 0}
            aria-label="Progression globale"
          />
        </div>

        {answeredTotal > 0 && (
          <Button variant="outline" size="lg" onClick={showSummary}>
            <ClipboardList aria-hidden /> Voir mon bilan
          </Button>
        )}

        {hasMoreCards ? (
          <Button size="lg" onClick={() => startDeck()}>
            <Shuffle aria-hidden /> Tous les thèmes, mélangés
          </Button>
        ) : (
          <p className="text-muted-foreground" aria-live="polite">
            Vous avez déjà répondu à toutes les cartes disponibles sur cet appareil. De nouvelles
            cartes seront ajoutées prochainement.
          </p>
        )}

        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-muted-foreground">Ou choisissez un thème</h2>
          {/* Alphabetical order and one shared style: no theme is put forward. */}
          <ul className="flex flex-col gap-2">
            {themeProgress.map((progress) => {
              const isComplete = isThemeComplete(progress);
              return (
                <li key={progress.theme.id}>
                  <Button
                    variant="outline"
                    className="h-auto w-full flex-col items-stretch gap-2 py-3 whitespace-normal"
                    disabled={isComplete}
                    onClick={() => startDeck(progress.theme)}
                  >
                    <span className="flex items-center justify-between gap-3">
                      <span className="text-left text-base">{progress.theme.label}</span>
                      <span className="flex shrink-0 items-center gap-1 text-muted-foreground">
                        {isComplete ? (
                          <>
                            <Check aria-hidden /> Terminé
                          </>
                        ) : (
                          `${progress.answered} sur ${progress.total}`
                        )}
                      </span>
                    </span>
                    <Progress
                      className="h-1.5"
                      value={(progress.answered / progress.total) * 100}
                      aria-hidden
                    />
                  </Button>
                </li>
              );
            })}
          </ul>
        </div>
      </section>
    );
  }

  if (phase === "summary") {
    return (
      <SurveySummary
        cards={cards}
        session={session}
        hasMoreCards={hasMoreCards}
        onContinue={() => startDeck()}
        onShowMenu={showMenu}
        onClear={clearDevice}
      />
    );
  }

  if (phase === "done" || !deck) {
    const themeDone = deck?.theme
      ? themeProgress.find(({ theme }) => theme.id === deck.theme?.id)
      : undefined;
    return (
      <section className="flex flex-col gap-4 text-center" aria-live="polite">
        <h1 className="text-3xl font-semibold">Merci</h1>
        <p className="text-muted-foreground">
          {answeredCount > 1
            ? `Vos ${answeredCount} réponses ont été prises en compte.`
            : "Votre réponse a été prise en compte."}
        </p>
        {themeDone && isThemeComplete(themeDone) && (
          <p className="text-muted-foreground">
            Vous avez fait le tour du thème «&nbsp;{themeDone.theme.label}&nbsp;».
          </p>
        )}
        {hasMoreCards ? (
          <div className="flex flex-col gap-2">
            <Button size="lg" onClick={() => startDeck()}>
              Continuer avec d&apos;autres cartes
            </Button>
            <Button variant="outline" size="lg" onClick={showSummary}>
              <ClipboardList aria-hidden /> Voir mon bilan
            </Button>
            <Button variant="outline" size="lg" onClick={showMenu}>
              <LayoutList aria-hidden /> Choisir un thème
            </Button>
            <p className="text-sm text-muted-foreground">
              Vous pouvez aussi vous arrêter ici : chaque réponse compte déjà.
            </p>
          </div>
        ) : (
          <>
            <p className="text-muted-foreground">Vous avez répondu à toutes les cartes disponibles.</p>
            <Button size="lg" onClick={showSummary}>
              <ClipboardList aria-hidden /> Voir mon bilan
            </Button>
          </>
        )}
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground" aria-live="polite">
            Carte {index + 1} sur {deck.cards.length}
          </p>
          <Button variant="ghost" size="sm" onClick={showMenu}>
            <LayoutList aria-hidden /> Thèmes
          </Button>
        </div>
        <Progress
          className="h-1.5"
          value={(index / deck.cards.length) * 100}
          aria-label="Progression du paquet"
        />
      </div>

      <div className="relative h-[clamp(18rem,52svh,24rem)]">
        <AnimatePresence custom={lastDirection} mode="popLayout">
          {currentCard && (
            <SwipeCard key={currentCard.id} card={currentCard} onSwipe={handleSwipe} />
          )}
        </AnimatePresence>
      </div>

      {/* Both answers share one neutral style: no colour suggests a right choice. */}
      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline" size="lg" onClick={() => handleSwipe("left")}>
          <ArrowLeft aria-hidden /> {answerLabels.no}
        </Button>
        <Button variant="outline" size="lg" onClick={() => handleSwipe("right")}>
          {answerLabels.yes} <ArrowRight aria-hidden />
        </Button>
        <Button variant="ghost" onClick={() => handleSwipe("up")}>
          <ArrowUp aria-hidden /> {answerLabels.dont_know}
        </Button>
        <Button variant="ghost" className="whitespace-normal" onClick={() => handleSwipe("down")}>
          <ArrowDown aria-hidden /> {answerLabels.prefer_not}
        </Button>
      </div>
    </section>
  );
}
