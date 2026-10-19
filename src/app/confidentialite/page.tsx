import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Confidentialité",
};

// Draft: the final wording must be validated before launch (see docs/DONNEES.md).
export default function PrivacyPage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 px-4 py-8">
      <h1 className="text-2xl font-semibold">Vos réponses et vos données</h1>
      <p>
        Ce questionnaire sert uniquement à identifier les besoins et les attentes de la population.
        Il ne vous classe pas et ne vous recommande rien.
      </p>
      <ul className="list-disc space-y-2 pl-5">
        <li>Aucun compte, nom, e-mail ni adresse IP n&apos;est enregistré avec vos réponses.</li>
        <li>
          Un identifiant aléatoire regroupe vos réponses d&apos;une même visite. Il ne permet pas de
          vous identifier.
        </li>
        <li>
          Pour bloquer les robots et les envois en masse, votre navigateur fait un petit calcul au
          démarrage, et votre adresse IP est transformée en une empreinte illisible, renouvelée
          chaque jour et effacée sous 24 heures. Elle n&apos;est jamais reliée à vos réponses.
        </li>
        <li>
          Votre appareil retient les cartes auxquelles vous avez déjà répondu, pour ne pas vous les
          reproposer. Cette liste reste sur votre appareil.
        </li>
        <li>Si des résultats sont un jour publiés, ce sera uniquement sous forme agrégée.</li>
        <li>Aucun outil de suivi publicitaire ni de mesure d&apos;audience tiers n&apos;est utilisé.</li>
      </ul>
      <p className="text-sm text-muted-foreground">
        Page provisoire : la politique de confidentialité complète sera publiée avant le lancement.
      </p>
      <Link href="/" className="underline underline-offset-4">
        Retour au questionnaire
      </Link>
    </main>
  );
}
