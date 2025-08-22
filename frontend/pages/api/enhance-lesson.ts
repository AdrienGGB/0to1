import type { NextApiRequest, NextApiResponse } from 'next'
import fetch from 'node-fetch'
import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const { lessonId, courseId } = req.body
  if (!lessonId || !courseId) return res.status(400).json({ error: 'Missing lessonId or courseId' })

  try {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!
    )

    // 1. Fetch lesson details from the database
    const { data: lessonData, error: fetchError } = await supabase
      .from('lessons')
      .select('title, summary')
      .eq('id', lessonId)
      .eq('course_id', courseId)
      .single()

    if (fetchError || !lessonData) {
      return res.status(404).json({ error: 'Lesson not found' })
    }

    const { title: lessonTitle, summary: lessonSummary } = lessonData

    // 2. Construct a detailed prompt based on phase2-5.md
    const promptTemplate = fs.readFileSync(path.join(process.cwd(), '..', 'prompts', 'lesson-generation.prompt.md'), 'utf-8');
    const prompt = promptTemplate
      .replace('{{TOPIC}}', lessonTitle)
      .replace('{{COURSE_ID}}', courseId);

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
      return res.status(response.status).json({ error: errorData })
    }

    const completion: { choices: { message: { content: string } }[] } = await response.json()
    const enhancedContent = completion.choices[0].message.content

    // 4. Update the lesson in the database with the new content
    const { error: updateError } = await supabase
      .from('lessons')
      .update({ content: enhancedContent })
      .eq('id', lessonId)

    if (updateError) {
      return res.status(500).json({ error: updateError.message })
    }

    res.status(200).json({ success: true, lessonId, enhancedContent })

  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
