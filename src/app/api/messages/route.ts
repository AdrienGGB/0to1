import { getClientIp, hashClientKey } from "@/lib/antiAbuse/clientKey";
import { getClientKeySecret, getSessionSecret, isWithinRateLimit } from "@/lib/antiAbuse/server";
import { isValidSessionToken } from "@/lib/antiAbuse/sessionToken";
import { loadDeck } from "@/lib/cards/loadCards";
import { priorityMessageRecordSchema, priorityQuestion } from "@/lib/priorityMessage";
import { createAnonServerClient } from "@/lib/supabase/server";

const UNIQUE_VIOLATION = "23505";

const knownThemes = new Set(loadDeck().map((card) => card.theme.id));

// One priority message per session. Like answers, it holds no identity data.
export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  const parsed = priorityMessageRecordSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "invalid_message" }, { status: 400 });
  }

  const record = parsed.data;
  const now = Date.now();
  if (!isValidSessionToken(getSessionSecret(), record.sessionId, record.sessionToken, now)) {
    return Response.json({ error: "invalid_session" }, { status: 401 });
  }
  if (!record.themeIds.every((themeId) => knownThemes.has(themeId))) {
    return Response.json({ error: "unknown_theme" }, { status: 400 });
  }

  const clientKey = hashClientKey(getClientKeySecret(), getClientIp(request.headers), new Date(now));
  if (!(await isWithinRateLimit("message", clientKey))) {
    return Response.json({ error: "rate_limited" }, { status: 429 });
  }

  const supabase = createAnonServerClient();
  if (!supabase) {
    return Response.json({ stored: false }, { status: 202 });
  }

  const { error } = await supabase.from("priority_messages").insert({
    session_id: record.sessionId,
    choice: record.choice,
    theme_ids: record.themeIds,
    question_version: priorityQuestion.version,
    display_seed: record.displaySeed,
  });
  if (error?.code === UNIQUE_VIOLATION) {
    // One message per session: keep the first.
    return Response.json({ stored: false, reason: "duplicate" }, { status: 409 });
  }
  if (error) {
    return Response.json({ error: "storage_failed" }, { status: 500 });
  }
  return Response.json({ stored: true }, { status: 201 });
}
