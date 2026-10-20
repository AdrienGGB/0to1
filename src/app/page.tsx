import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { loadDeck } from "@/lib/cards/loadCards";
import { getThemeProgress } from "@/lib/cards/themeProgress";
import { MIN_COUNT_FOR_STATS } from "@/lib/stats";

const METHOD_URL = "https://github.com/AdrienGGB/requete/blob/main/docs/NEUTRALITE.md";

const steps = [
  {
    title: "Choisissez un thème, ou mélangez-les tous",
    text: "Logement, santé, travail, impôts, climat, sécurité… Vous répondez à votre rythme, par paquets courts.",
  },
  {
    title: "Répondez d'un geste",
    text: "Une affirmation par carte. Oui, non, je ne sais pas ou je préfère ne pas répondre : il n'y a pas de bonne réponse.",
  },
  {
    title: "Recevez votre bilan",
    text: "Vos réponses regroupées, comparées à celles des autres participants dès qu'il y en a assez, et les thèmes que vous voulez voir traités en priorité.",
  },
];

const principles = [
  {
    title: "Neutre",
    text: "Aucun parti, aucun classement, aucune recommandation. Chaque affirmation existe aussi dans le sens inverse, pour ne pousser vers aucune réponse.",
  },
  {
    title: "Anonyme",
    text: "Ni compte, ni nom, ni e-mail. Votre adresse IP n'est jamais enregistrée avec vos réponses.",
  },
  {
    title: "Transparent",
    text: "Les questions, la méthode et le code sont publics. Chacun peut vérifier comment une affirmation est rédigée.",
  },
];

export default function Home() {
  const themes = getThemeProgress(loadDeck(), new Set());
  const cardCount = themes.reduce((sum, { total }) => sum + total, 0);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 sm:px-6">
      <header className="flex h-16 items-center justify-between">
        <span className="font-semibold">ReQuête</span>
        <Link
          href="/confidentialite"
          className="text-sm text-muted-foreground underline-offset-4 hover:underline"
        >
          Vos données
        </Link>
      </header>

      <section className="flex flex-col gap-6 pt-10 pb-16 sm:pt-16">
        <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          Dites ce dont vous avez besoin.
        </h1>
        <p className="max-w-[60ch] text-lg leading-relaxed text-muted-foreground">
          ReQuête recueille les besoins et les priorités de chacun, de façon neutre et anonyme, en
          quelques gestes.
        </p>
        <Button asChild size="lg" className="w-full sm:w-fit">
          <Link href="/repondre">
            Répondre <ArrowRight aria-hidden />
          </Link>
        </Button>
      </section>

      <section className="flex flex-col gap-6 border-t py-12" aria-labelledby="how">
        <h2 id="how" className="text-2xl font-semibold tracking-tight">
          Comment ça marche
        </h2>
        <ol className="flex flex-col gap-6">
          {steps.map((step, index) => (
            <li key={step.title} className="grid grid-cols-[2rem_1fr] gap-x-3">
              <span className="text-lg font-semibold text-muted-foreground tabular-nums" aria-hidden>
                {index + 1}
              </span>
              <div className="flex flex-col gap-1">
                <h3 className="font-semibold">{step.title}</h3>
                <p className="leading-relaxed text-muted-foreground">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="flex flex-col gap-6 border-t py-12" aria-labelledby="principles">
        <h2 id="principles" className="text-2xl font-semibold tracking-tight">
          Nos principes
        </h2>
        <dl className="grid gap-6 sm:grid-cols-3">
          {principles.map((principle) => (
            <div key={principle.title} className="flex flex-col gap-1">
              <dt className="font-semibold">{principle.title}</dt>
              <dd className="leading-relaxed text-muted-foreground">{principle.text}</dd>
            </div>
          ))}
        </dl>
        <a
          href={METHOD_URL}
          className="text-sm underline underline-offset-4"
          target="_blank"
          rel="noreferrer"
        >
          Lire la charte de neutralité
        </a>
      </section>

      <section className="flex flex-col gap-4 border-t py-12" aria-labelledby="themes">
        <h2 id="themes" className="text-2xl font-semibold tracking-tight">
          {themes.length} thèmes, {cardCount} cartes
        </h2>
        {/* Alphabetical and one shared style: no theme is put forward (docs/NEUTRALITE.md §5). */}
        <ul className="flex flex-wrap gap-2">
          {themes.map(({ theme }) => (
            <li key={theme.id} className="rounded-full border px-3 py-1 text-sm">
              {theme.label}
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-4 border-t py-12" aria-labelledby="use">
        <h2 id="use" className="text-2xl font-semibold tracking-tight">
          À quoi servent les réponses
        </h2>
        <p className="max-w-[65ch] leading-relaxed text-muted-foreground">
          À faire apparaître ce dont les gens ont besoin, directement, sans passer par des questions
          choisies d&apos;avance par d&apos;autres. Les réponses ne sont montrées que sous forme de
          totaux, et seulement à partir de {MIN_COUNT_FOR_STATS} réponses par question. Les
          participants ne forment pas un échantillon représentatif de la population.
        </p>
      </section>

      <section className="flex flex-col items-start gap-4 border-t py-12">
        <p className="text-lg font-semibold">Quelques minutes suffisent. Vous pouvez arrêter quand vous voulez.</p>
        <Button asChild size="lg" className="w-full sm:w-fit">
          <Link href="/repondre">
            Répondre <ArrowRight aria-hidden />
          </Link>
        </Button>
      </section>

      <footer className="flex flex-wrap gap-x-6 gap-y-2 border-t py-6 text-sm text-muted-foreground">
        <Link href="/confidentialite" className="underline-offset-4 hover:underline">
          Vos données
        </Link>
        <a href={METHOD_URL} className="underline-offset-4 hover:underline" target="_blank" rel="noreferrer">
          Méthode
        </a>
      </footer>
    </main>
  );
}
