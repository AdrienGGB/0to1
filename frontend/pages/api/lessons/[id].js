import { createClient } from '@supabase/supabase-js';
import { createPagesServerClient } from '@/utils/supabase/pages-router-server'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).end(); // Method Not Allowed
  }

  const supabase = createPagesServerClient(req, res)
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return res.status(401).json({ error: 'Not authenticated' })
  }

  const { id: lessonId, courseId } = req.query;

  if (!lessonId || !courseId) {
    return res.status(400).json({ error: 'Missing lessonId or courseId' });
  }

  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data, error } = await supabaseAdmin
      .from('lessons')
      .select('*') // Select all columns, including content
      .eq('id', lessonId)
      .eq('course_id', courseId)
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: error.message });
    }

    if (!data) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: error.message });
  }
}