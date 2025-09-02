import { createPagesServerClient } from '@/utils/supabase/pages-router-server';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).end();
  }

  const supabase = createPagesServerClient(req, res);

  const { data: courses, error } = await supabase
    .from('courses')
    .select('id,title,description,created_at')
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.status(200).json(courses);
}