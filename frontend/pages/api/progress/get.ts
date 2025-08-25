import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabase = createMiddlewareClient({ req, res })
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return res.status(401).json({ error: 'Not authenticated' })
  }

  const { courseId } = req.query as { courseId?: string };
  if (!courseId) return res.status(400).json({ error: 'Missing courseId' });

  const supabaseAdmin = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

  const { data, error } = await supabaseAdmin
    .from('user_progress')
    .select('progress')
    .eq('user_id', session.user.id)
    .eq('course_id', courseId)
    .single();

  if (error && error.code === 'PGRST116') return res.status(404).json({ progress: null });

  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ progress: data?.progress ?? null });
}