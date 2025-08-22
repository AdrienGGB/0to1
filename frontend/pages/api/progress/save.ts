// FILE: frontend/pages/api/progress/save.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

type ProgressPayload = {
  version: number;
  completedLessonIds: string[];
  lastLessonId?: string;
  lessonTimes?: Record<string, number>;
  timeSpentSeconds?: number;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { userId, courseId, progress, clientUpdatedAt } = req.body as {
    userId: string;
    courseId: string;
    progress: ProgressPayload;
    clientUpdatedAt?: string;
  };

  if (!userId || !courseId || !progress) return res.status(400).json({ error: 'Missing fields' });

  try {
    const { data: existingRows } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .limit(1);

    const existing = existingRows && existingRows[0] ? existingRows[0] : null;

    // parse existing progress
    const existingProgress = existing?.progress ?? { version: 1, completedLessonIds: [], lessonTimes: {}, timeSpentSeconds: 0 };

    // merge completedLessonIds (union)
    const existingSet = new Set(existingProgress.completedLessonIds || []);
    (progress.completedLessonIds || []).forEach((id: string) => existingSet.add(id));
    const mergedCompletedLessonIds = Array.from(existingSet);

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
    const payloadRow = {
      user_id: userId,
      course_id: courseId,
      progress: mergedProgress,
    };

    const { error: upsertError } = await supabase
      .from('user_progress')
      .upsert(payloadRow, { onConflict: ['user_id', 'course_id'] });

    if (upsertError) throw upsertError;

    return res.status(200).json({ progress: mergedProgress });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: err.message || String(err) });
  }
}
