You are an expert teacher. Given a topic: "{topic}", generate a beginner-friendly course with 3 to 7 practical lessons.
Return JSON ONLY in this format:
{
  "title": "...",
  "description": "...",
  "lessons": [
    { "order": 1, "title": "...", "summary": "...", "content": "...", "duration_minutes": 10 },
    ...
  ]
}
