import type { Metadata } from "next";

import { Survey } from "@/components/Survey";
import { loadDeck } from "@/lib/cards/loadCards";

export const metadata: Metadata = {
  title: "Répondre",
};

export default function AnswerPage() {
  const cards = loadDeck();

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-4 sm:py-8">
      <Survey cards={cards} />
    </main>
  );
}
