import { getClientIp, hashClientKey } from "@/lib/antiAbuse/clientKey";
import { getClientKeySecret, getSessionSecret, isWithinRateLimit } from "@/lib/antiAbuse/server";
import { isValidSessionToken } from "@/lib/antiAbuse/sessionToken";
import { answerRecordSchema } from "@/lib/answers";
import { loadDeck } from "@/lib/cards/loadCards";
import { createAnonServerClient } from "@/lib/supabase/server";

const UNIQUE_VIOLATION = "23505";

const knownCards = new Set(loadDeck().map((card) => `${card.id}@${card.version}`));

// Stores the body only. The IP is hashed for rate limiting and never stored with answers.
export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  const parsed = answerRecordSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "invalid_answer" }, { status: 400 });
  }

  const record = parsed.data;
  const now = Date.now();
  if (!isValidSessionToken(getSessionSecret(), record.sessionId, record.sessionToken, now)) {
    return Response.json({ error: "invalid_session" }, { status: 401 });
  }
  if (!knownCards.has(`${record.cardId}@${record.cardVersion}`)) {
    return Response.json({ error: "unknown_card" }, { status: 400 });
  }

  const clientKey = hashClientKey(getClientKeySecret(), getClientIp(request.headers), new Date(now));
  if (!(await isWithinRateLimit("answer", clientKey))) {
    return Response.json({ error: "rate_limited" }, { status: 429 });
  }

  const supabase = createAnonServerClient();
  if (!supabase) {
    return Response.json({ stored: false }, { status: 202 });
  }

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
  if (error?.code === UNIQUE_VIOLATION) {
    // Same card answered twice in one session: keep the first answer.
    return Response.json({ stored: false, reason: "duplicate" }, { status: 409 });
  }
  if (error) {
    return Response.json({ error: "storage_failed" }, { status: 500 });
  }
  return Response.json({ stored: true }, { status: 201 });
}
