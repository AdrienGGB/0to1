import { createPagesServerClient } from '@/utils/supabase/pages-router-server';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).end();
  }

  const { id } = req.query;

  const supabase = createPagesServerClient(req, res);

  const { data: course, error } = await supabase
    .from('courses')
    .select(`
      *,
      lessons (*)
    `)
    .eq('id', id)
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  if (!course) {
    return res.status(404).json({ error: 'Course not found' });
  }

  res.status(200).json(course);
}