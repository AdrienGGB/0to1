import type { NextApiRequest, NextApiResponse } from 'next'
import fetch from 'node-fetch'
import { createClient } from '@supabase/supabase-js'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const { topic } = req.body
  if (!topic) return res.status(400).json({ error: 'Missing topic' })

  const prompt = `You are an expert teacher. Given topic: "${topic}", produce a beginner course that takes someone from 0 to 1.
Return ONLY JSON in this shape:
{
  "title": "string",
  "description": "string",
  "lessons": [
    { "order": 1, "title": "string", "summary": "string", "content": "string", "duration_minutes": 10 }
  ]
}
Make lessons concise and practical.`

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

    const data = await response.json()
    const aiText = data.choices[0].message.content
    const course = JSON.parse(aiText)

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )

    const { data, error } = await supabase.rpc('create_course_with_lessons', {
      course_title: course.title,
      course_description: course.description,
      course_topic: topic,
      course_ai_prompt: { prompt },
      lessons_data: course.lessons,
    });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.status(200).json({ course: { id: data } });

  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
