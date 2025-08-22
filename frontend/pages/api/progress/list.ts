// FILE: frontend/pages/api/progress/list.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId } = req.query as { userId?: string };
  if (!userId) return res.status(400).json({ error: 'Missing query param: userId' });

  const { data, error } = await supabase
    .from('user_progress')
    .select('course_id, progress, updated_at')
    .eq('user_id', userId);

  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ items: data ?? [] });
}
