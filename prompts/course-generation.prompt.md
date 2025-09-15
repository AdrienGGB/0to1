You are an expert teacher. Given a topic: "{topic}" and a level: "{level}", generate a course with practical lessons.
The requirements for each level are:
- Beginner: short, introductory lessons, simple examples. 3-5 lessons.
- Intermediate: medium length, adds best practices and light theory. 5-8 lessons.
- Expert: in-depth analysis, edge cases, complex exercises. 8-12 lessons.

Return JSON ONLY in this format:
{
  "title": "...",
  "description": "...",
  "lessons": [
    { "order": 1, "title": "...", "summary": "...", "content": "...", "duration_minutes": 10 },
    ...
  ]
}