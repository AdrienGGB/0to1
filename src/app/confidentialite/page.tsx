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
          Votre appareil retient les cartes auxquelles vous avez déjà répondu et vos réponses, pour
          ne pas vous les reproposer et pour calculer votre bilan. Elles restent sur votre appareil,
          et le bilan propose de les effacer. Sur un appareil partagé, pensez à le faire.
        </li>
        <li>
          Les thèmes que vous choisissez comme prioritaires sont enregistrés, anonymes, comme vos
          réponses aux cartes.
        </li>
        <li>
          Les comparaisons du bilan sont des totaux : aucun chiffre n&apos;est affiché tant
          qu&apos;une carte ou une question n&apos;a pas reçu au moins 100 réponses.
        </li>
        <li>Aucun outil de suivi publicitaire ni de mesure d&apos;audience tiers n&apos;est utilisé.</li>
      </ul>
      <p className="text-sm text-muted-foreground">
        Page provisoire : la politique de confidentialité complète sera publiée avant le lancement.
      </p>
      <Link href="/repondre" className="underline underline-offset-4">
        Retour au questionnaire
      </Link>
    </main>
  );
}
