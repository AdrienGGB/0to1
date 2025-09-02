import type { NextApiRequest, NextApiResponse } from 'next'
import fetch from 'node-fetch'
import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import { createPagesServerClient } from '@/utils/supabase/pages-router-server'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const supabase = createPagesServerClient({ req, res })
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return res.status(401).json({ error: 'Not authenticated' })
  }

  const { topic } = req.body
  if (!topic) return res.status(400).json({ error: 'Missing topic' })

  const promptTemplate = fs.readFileSync(path.join(process.cwd(), '..', 'prompts', 'course-generation.prompt.md'), 'utf-8');
  const prompt = promptTemplate.replace('{topic}', topic);

  try {
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
      return res.status(response.status).json({ error: errorData })
    }

    const data = await response.json() as { choices: { message: { content: string } }[] }
    let aiText = data.choices[0].message.content
    // Extract JSON from markdown code block if present
    const jsonMatch = aiText.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch && jsonMatch[1]) {
      aiText = jsonMatch[1];
    }
    const course = JSON.parse(aiText)
    const lessonsWithContent = course.lessons.map((lesson: { title: string; summary: string; content: string; }) => ({
      ...lesson,
      content: ''
    }));

    const supabaseAdmin = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: newCourseData, error } = await supabaseAdmin.rpc('create_course_with_lessons', {
      course_title: course.title,
      course_description: course.description,
      course_topic: topic,
      course_ai_prompt: { prompt },
      lessons_data: lessonsWithContent,
    });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.status(200).json({ course: { id: newCourseData } });

  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}