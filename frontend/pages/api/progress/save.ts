import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { createPagesServerClient } from '@/utils/supabase/pages-router-server'

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

type ProgressPayload = {
  version: number;
  completedLessonIds: string[];
  lastLessonId?: string;
  lessonTimes?: Record<string, number>;
  timeSpentSeconds?: number;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const supabase = createPagesServerClient({ req, res })
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return res.status(401).json({ error: 'Not authenticated' })
  }

  const { courseId, progress, clientUpdatedAt } = req.body as {
    courseId: string;
    progress: ProgressPayload;
    clientUpdatedAt?: string;
  };

  if (!courseId || !progress) return res.status(400).json({ error: 'Missing fields' });

  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  try {
    const { data: existingRows } = await supabaseAdmin
      .from('user_progress')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('course_id', courseId)
      .limit(1);

    const existing = existingRows && existingRows[0] ? existingRows[0] : null;

    // parse existing progress
    const existingProgress = existing?.progress ?? { version: 1, completedLessonIds: [], lessonTimes: {}, timeSpentSeconds: 0 };

    // merge completedLessonIds (union)
    const existingSet = new Set(existingProgress.completedLessonIds || []);
    (progress.completedLessonIds || []).forEach((id: string) => existingSet.add(id));
    const mergedCompletedLessonIds: string[] = Array.from(existingSet) as string[];

    // merge lessonTimes: take max per lesson
    const mergedLessonTimes: Record<string, number> = { ...(existingProgress.lessonTimes || {}) };
    for (const [lessonId, secs] of Object.entries(progress.lessonTimes || {})) {
      mergedLessonTimes[lessonId] = Math.max(mergedLessonTimes[lessonId] || 0, secs || 0);
    }

    // recompute total time as sum of lesson times
    const mergedTimeSpentSeconds = Object.values(mergedLessonTimes).reduce((a, b) => a + b, 0);

    // decide lastLessonId: prefer the most recent clientUpdatedAt if provided, otherwise incoming
    let mergedLastLessonId = existingProgress.lastLessonId;
    if (clientUpdatedAt) {
      const clientTs = Date.parse(clientUpdatedAt);
      const serverTs = existing?.updated_at ? Date.parse(existing.updated_at) : 0;
      if (clientTs >= serverTs) mergedLastLessonId = progress.lastLessonId ?? mergedLastLessonId;
    } else {
      mergedLastLessonId = progress.lastLessonId ?? mergedLastLessonId;
    }

    const mergedProgress = {
      version: 1,
      completedLessonIds: mergedCompletedLessonIds,
      lessonTimes: mergedLessonTimes,
      timeSpentSeconds: mergedTimeSpentSeconds,
      lastLessonId: mergedLastLessonId,
    };

    // upsert (insert or update)
    const payloadRow: { user_id: string; course_id: string; progress: ProgressPayload } = {
      user_id: session.user.id,
      course_id: courseId,
      progress: mergedProgress,
    };

    const { error: upsertError } = await supabaseAdmin
      .from('user_progress')
      .upsert([payloadRow], { onConflict: 'user_id,course_id' });

    if (upsertError) throw upsertError;

    return res.status(200).json({ progress: mergedProgress });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: err.message || String(err) });
  }
}