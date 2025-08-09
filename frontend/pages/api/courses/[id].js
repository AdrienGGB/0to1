
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).end();
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Missing course ID' });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  try {
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('*')
      .eq('id', id)
      .single();

    if (courseError) {
      throw courseError;
    }

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const { data: lessons, error: lessonsError } = await supabase
      .from('lessons')
      .select('*')
      .eq('course_id', id)
      .order('order', { ascending: true });

    if (lessonsError) {
      throw lessonsError;
    }

    course.lessons = lessons;

    res.status(200).json(course);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
