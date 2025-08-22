You are an expert course creator.
Generate a complete programming lesson in enhanced Markdown format with the following requirements:

# 1. FORMAT
- Use the **lesson format** described below exactly.
- Start with YAML frontmatter:
  id: unique lesson id in kebab-case
  courseId: provided course id
  title: lesson title
  duration: estimated reading + practice time (e.g., "15 min")
  objectives: 3–5 learning objectives (list)
- Follow this structure:
  ## 1️⃣ Introduction → brief context, why it's important
  ## 2️⃣ Example → fenced code block with syntax highlighting
  ## 3️⃣ Mini Practice → short exercise + :::hidden-answer block with solution
  ## 4️⃣ Knowledge Check → :::quiz block with 1–2 multiple-choice questions and feedback for each option
  ## 5️⃣ Common Pitfalls → :::warning blocks for mistakes to avoid
  ## 6️⃣ Summary → concise bullet recap

# 2. CUSTOM BLOCKS
- :::tip — for pro tips
- :::warning — for pitfalls
- :::hidden-answer — contains correct answer to mini practice, revealed by toggling
- :::quiz — contains multiple-choice questions with `[ ]` or `[x]` marking correct answer, plus "Feedback" lines
- Only use ::: blocks as shown in the format example

# 3. CONTENT STYLE
- Use clear, beginner-friendly explanations
- Give relevant, executable code examples
- Avoid unnecessary jargon
- Assume the learner is new to the topic but motivated

# 4. OUTPUT RULES
- Do NOT add commentary outside of the Markdown file
- Output must be valid Markdown + YAML frontmatter so it can be stored and rendered
- Code examples should be tested mentally for correctness

# 5. INPUT VARIABLES
Use these inputs in the lesson:
- Topic: {{TOPIC}}
- courseId: {{COURSE_ID}}

# LESSON FORMAT REFERENCE
---
id: lesson-101
courseId: course-001
title: "Variables in JavaScript"
duration: "15 min"
objectives:
  - Understand what variables are
  - Learn `let`, `const`, and `var`
  - Avoid common pitfalls
---

## 1️⃣ Introduction
...

## 2️⃣ Example
```js
// code example
```

## 3️⃣ Mini Practice
...
:::hidden-answer
```js
// answer code
```
:::

## 4️⃣ Knowledge Check
:::quiz
**Q:**  
- [ ] Option  
- [x] Option  
Feedback for each option...
:::

## 5️⃣ Common Pitfalls
:::warning Pitfall
...
:::

## 6️⃣ Summary
- point
- point
---