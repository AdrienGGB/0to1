import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { createPagesServerClient } from '@/utils/supabase/pages-router-server'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabase = createPagesServerClient({ req, res })
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return res.status(401).json({ error: 'Not authenticated' })
  }

  const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

  const { data, error } = await supabaseAdmin
    .from('user_progress')
    .select('course_id, progress, updated_at')
    .eq('user_id', session.user.id);

  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ items: data ?? [] });
}