import type { NextApiRequest, NextApiResponse } from 'next'
import fetch from 'node-fetch'
import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import { createPagesServerClient } from '@/utils/supabase/pages-router-server'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  if (!process.env.OPENROUTER_API_KEY) {
    console.error('OPENROUTER_API_KEY is not set');
    return res.status(500).json({ error: 'OPENROUTER_API_KEY is not set' });
  }


  const supabase = createPagesServerClient(req, res)
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return res.status(401).json({ error: 'Not authenticated' })
  }

  const { lessonId, courseId } = req.body
  if (!lessonId || !courseId) return res.status(400).json({ error: 'Missing lessonId or courseId' })

  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // 1. Fetch lesson details from the database
    const { data: lessonData, error: fetchError } = await supabaseAdmin
      .from('lessons')
      .select('title, summary')
      .eq('id', lessonId)
      .eq('course_id', courseId)
      .single()

    if (fetchError || !lessonData) {
      return res.status(404).json({ error: 'Lesson not found' })
    }

    const { title: lessonTitle, summary: lessonSummary } = lessonData

    // 1.1 Fetch course level
    const { data: courseData, error: courseError } = await supabaseAdmin
        .from('courses')
        .select('level')
        .eq('id', courseId)
        .single();

    if (courseError || !courseData) {
        return res.status(404).json({ error: 'Course not found' });
    }
    const { level } = courseData;

    // 1.2 Fetch the full course structure
    const { data: courseLessons, error: courseLessonsError } = await supabaseAdmin
      .from('lessons')
      .select('title, order')
      .eq('course_id', courseId)
      .order('order', { ascending: true });

    if (courseLessonsError) {
      // We don't want to block the lesson generation if this fails, so we'll just log the error
      console.error('Failed to fetch course structure:', courseLessonsError);
    }

    const courseStructure = courseLessons
      ? courseLessons.map(lesson => `${lesson.order}. ${lesson.title}`).join('\n')
      : 'Course structure not available.';

    // 2. Construct a detailed prompt based on phase2-5.md
    const promptTemplate = fs.readFileSync(path.join(process.cwd(), '..', 'prompts', 'lesson-generation.prompt.md'), 'utf-8');
    const prompt = promptTemplate
      .replace('{{TOPIC}}', lessonTitle)
      .replace('{{COURSE_ID}}', courseId)
      .replace('{{COURSE_STRUCTURE}}', courseStructure)
      .replace('{{LEVEL}}', level);

    // 3. Call the AI service to generate the enhanced lesson content
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL || 'deepseek/deepseek-r1-0528:free',
        messages: [{ role: 'user', content: prompt }]
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('OpenRouter error:', errorData);
      return res.status(response.status).json({ error: errorData })
    }

    const completion = await response.json() as { choices: { message: { content: string } }[] }
    const enhancedContent = completion.choices[0].message.content

    // 4. Update the lesson in the database with the new content
    const { error: updateError } = await supabaseAdmin
      .from('lessons')
      .update({ content: enhancedContent })
      .eq('id', lessonId)

    if (updateError) {
      return res.status(500).json({ error: updateError.message })
    }

    res.status(200).json({ id: lessonId, content: enhancedContent })

  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message || String(err) });
  }
}