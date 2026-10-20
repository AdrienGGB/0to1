import { cacheLife } from "next/cache";
import { connection } from "next/server";

import { priorityQuestion } from "@/lib/priorityMessage";
import { emptyStats, type SummaryStats } from "@/lib/stats";
import { createAnonServerClient } from "@/lib/supabase/server";

/**
 * Aggregates for the summary. The database only returns cards and themes past the minimum
 * count, so nothing here can be narrowed down to a few people.
 */
async function getSummaryStats(): Promise<SummaryStats> {
  "use cache";
  cacheLife("minutes");

  const supabase = createAnonServerClient();
  if (!supabase) {
    return emptyStats;
  }
  const [cards, messages] = await Promise.all([
    supabase.rpc("card_answer_stats"),
    supabase.rpc("message_choice_stats"),
  ]);
  // Throwing keeps a failed read out of the cache.
  if (cards.error || messages.error) {
    throw new Error("stats_unavailable");
  }
  // Only the version people answer today: versions are never counted together.
  const currentMessages = messages.data.filter(
    (row) => row.question_version === priorityQuestion.version,
  );

  return {
    cards: Object.fromEntries(
      cards.data.map((row) => [
        `${row.card_id}@${row.card_version}`,
        {
          total: Number(row.total),
          counts: {
            yes: Number(row.yes),
            no: Number(row.no),
            dont_know: Number(row.dont_know),
            prefer_not: Number(row.prefer_not),
          },
          since: row.first_answer_at,
        },
      ]),
    ),
    message:
      currentMessages.length > 0
        ? {
            total: Number(currentMessages[0].total),
            counts: Object.fromEntries(currentMessages.map((row) => [row.option, Number(row.chosen)])),
            since: currentMessages[0].first_message_at,
          }
        : null,
  };
}

export async function GET() {
  // Read at request time: a build without the database must not freeze an empty answer.
  await connection();
  try {
    return Response.json(await getSummaryStats());
  } catch {
    return Response.json(emptyStats, { headers: { "Cache-Control": "no-store" } });
  }
}
