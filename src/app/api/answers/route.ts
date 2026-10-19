import { answerRecordSchema } from "@/lib/answers";
import { createAnonServerClient } from "@/lib/supabase/server";

// Deliberately reads nothing from the request beyond its body: no IP, no user agent, no cookies.
export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  const parsed = answerRecordSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "invalid_answer" }, { status: 400 });
  }

  const supabase = createAnonServerClient();
  if (!supabase) {
    return Response.json({ stored: false }, { status: 202 });
  }

  const record = parsed.data;
  const { error } = await supabase.from("answers").insert({
    session_id: record.sessionId,
    card_id: record.cardId,
    card_version: record.cardVersion,
    answer: record.answer,
    position: record.position,
    deck_seed: record.deckSeed,
    response_ms: record.responseMs,
    is_fast: record.isFast,
  });
  if (error) {
    return Response.json({ error: "storage_failed" }, { status: 500 });
  }
  return Response.json({ stored: true }, { status: 201 });
}
