"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence } from "motion/react";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp } from "lucide-react";

import { SwipeCard } from "@/components/SwipeCard";
import { Button } from "@/components/ui/button";
import {
  answerLabels,
  getAnswerForDirection,
  isFastAnswer,
  type AnswerRecord,
  type SwipeDirection,
} from "@/lib/answers";
import { filterUnanswered, markAnswered, readAnsweredKeys } from "@/lib/answeredStore";
import type { DeckCard } from "@/lib/cards/schema";
import { createSeed, shuffleWithSeed } from "@/lib/shuffle";
import {
  openSession,
  prepareChallenge,
  type AnswerSession,
  type SolvedChallenge,
} from "@/lib/startSession";

type Phase = "intro" | "starting" | "error" | "deck" | "done" | "nothing-left";

interface DeckSession extends AnswerSession {
  seed: number;
  cards: DeckCard[];
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
  const [session, setSession] = useState<DeckSession | null>(null);
  const [index, setIndex] = useState(0);
  const [lastDirection, setLastDirection] = useState<SwipeDirection | null>(null);
  const shownAtRef = useRef(0);
  const challengeRef = useRef<Promise<SolvedChallenge> | null>(null);

  // Solve the anti-bot challenge in the background while the intro is being read.
  useEffect(() => {
    const pending = prepareChallenge();
    pending.catch(() => undefined);
    challengeRef.current = pending;
  }, []);

  async function startSurvey() {
    const remaining = filterUnanswered(cards, readAnsweredKeys());
    if (remaining.length === 0) {
      setPhase("nothing-left");
      return;
    }
    setPhase("starting");
    try {
      const solved = await (challengeRef.current ?? prepareChallenge());
      // The server-issued id groups the answers of one sitting, nothing more.
      const answerSession = await openSession(solved);
      const seed = createSeed();
      setSession({ ...answerSession, seed, cards: shuffleWithSeed(remaining, seed) });
      setIndex(0);
      setPhase("deck");
      shownAtRef.current = performance.now();
    } catch {
      // A challenge is single-use: retrying needs a fresh one.
      challengeRef.current = null;
      setPhase("error");
    }
  }

  const currentCard = session?.cards[index];

  const handleSwipe = useCallback(
    (direction: SwipeDirection) => {
      if (!session || !currentCard) {
        return;
      }
      const responseMs = Math.round(performance.now() - shownAtRef.current);
      sendAnswer({
        sessionId: session.sessionId,
        sessionToken: session.sessionToken,
        cardId: currentCard.id,
        cardVersion: currentCard.version,
        answer: getAnswerForDirection(direction),
        position: index,
        deckSeed: session.seed,
        responseMs,
        isFast: isFastAnswer(responseMs),
      });

      markAnswered(currentCard);
      setLastDirection(direction);
      shownAtRef.current = performance.now();
      if (index + 1 >= session.cards.length) {
        setPhase("done");
      }
      setIndex(index + 1);
    },
    [session, currentCard, index],
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

  if (phase === "nothing-left") {
    return (
      <section className="flex flex-col gap-4 text-center" aria-live="polite">
        <h1 className="text-3xl font-semibold">Merci</h1>
        <p className="text-muted-foreground">
          Vous avez déjà répondu à toutes les cartes disponibles sur cet appareil. De nouvelles
          cartes seront ajoutées prochainement.
        </p>
      </section>
    );
  }

  if (phase === "done" || !session) {
    return (
      <section className="flex flex-col gap-4 text-center" aria-live="polite">
        <h1 className="text-3xl font-semibold">Merci</h1>
        <p className="text-muted-foreground">
          Vos {session?.cards.length ?? 0} réponses ont été prises en compte.
        </p>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="text-sm text-muted-foreground" aria-live="polite">
          Carte {index + 1} sur {session.cards.length}
        </p>
        <div
          className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={session.cards.length}
          aria-valuenow={index}
          aria-label="Progression"
        >
          <div
            className="h-full bg-primary transition-[width]"
            style={{ width: `${(index / session.cards.length) * 100}%` }}
          />
        </div>
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
