// FILE: frontend/pages/api/progress/get.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId, courseId } = req.query as { userId?: string; courseId?: string };
  if (!userId || !courseId) return res.status(400).json({ error: 'Missing query params' });

  const { data, error } = await supabase
    .from('user_progress')
    .select('progress')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .single();

  if (error && error.code === 'PGRST116') return res.status(404).json({ progress: null });

  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ progress: data?.progress ?? null });
}
