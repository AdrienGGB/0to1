import { connection } from "next/server";

import { createSessionChallenge } from "@/lib/antiAbuse/challenge";
import { getChallengeSecrets } from "@/lib/antiAbuse/server";

export async function GET() {
  await connection();
  const challenge = await createSessionChallenge(getChallengeSecrets(), Date.now());
  return Response.json(challenge, { headers: { "Cache-Control": "no-store" } });
}
