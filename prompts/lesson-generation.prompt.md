You are an expert course creator.
Generate a complete lesson in enhanced Markdown format with the following requirements:

# 1. FORMAT
- Use the **lesson format** described below exactly.
- Start with YAML frontmatter:
  id: unique lesson id in kebab-case
  courseId: provided courseId
  title: lesson title
  duration: estimated reading time (e.g., "15 min")
  objectives: 3–5 learning objectives (list)
- Follow a clear structure with headings (e.g., `## Introduction`, `## Key Concepts`, etc.).

# 2. CONTENT STYLE
- Use clear, accessible, and engaging language.
- Focus on maximizing knowledge and understanding of the topic.
- Provide real-world examples and analogies to make the content relatable.
- Avoid jargon where possible, or explain it clearly when necessary.
- **For non-technical topics, do not include code snippets or programming-related examples.**
- **Use emojis to make the content more engaging and visually appealing.** Use them appropriately to illustrate concepts and break up the text.
- The tone should be encouraging and inspiring.

# 3. OUTPUT RULES
- Do NOT add commentary outside of the Markdown file.
- Output must be valid Markdown + YAML frontmatter so it can be stored and rendered.

# 4. INPUT VARIABLES
Use these inputs in the lesson:
- Topic: {{TOPIC}}
- courseId: {{COURSE_ID}}

# 5. CONTEXT
This lesson is part of a larger course. Here is the full course structure:
{{COURSE_STRUCTURE}}

Use this context to ensure the lesson is well-aligned with the other lessons in the course. The content should build upon previous lessons and set the stage for upcoming lessons.

# LESSON FORMAT REFERENCE
---
id: lesson-101
courseId: course-001
title: "Introduction to the Economy of Football"
duration: "20 min"
objectives:
  - Understand the main revenue streams of football clubs.
  - Learn about the role of broadcasting rights in football's economy.
  - Get an overview of player transfers and their financial impact.
---

## Introduction
...

## Key Revenue Streams
...

> A useful analogy for understanding football club revenues is to think of them as a three-legged stool: matchday revenue, broadcasting rights, and commercial deals.

## Broadcasting Rights: The Game Changer
...

## Player Transfers: A Billion-Dollar Market
...

## Summary
...

---

Now, generate the lesson for the topic: {{TOPIC}}