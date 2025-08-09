# 0to1 Project
## Vision

**Core idea:** A lightning-fast AI learning assistant that turns any topic into a structured beginner-friendly course in seconds.

**What it delivers:**

- User enters any topic → AI generates a 0→1 course with clear lessons and practical content.
- Simple, distraction-free interface to browse lessons.
- Instant value: no account required, no setup, no barriers.

**Differentiator:** Unlike traditional course platforms, the content is generated on demand for *your exact topic*, keeping it fresh, relevant, and tailored.

**Long-term vision:**

- Become the go-to tool for rapid learning on any subject.
- Support both AI-generated and human-authored courses.
- Enable progress tracking, assessments, and certifications.
- Grow into a community-driven platform with high-quality learning paths.

**MVP scope:**

- Topic input → AI course generation → View in web app.
- No auth, minimal UI, core focus on speed and value.

---

## Overview / Goal

**Goal for Phase 1 (Core):**

- Enable a user to enter a topic and receive an AI-generated beginner course (0→1).
- Persist generated courses in Supabase.
- Allow viewing the course and lessons in a single-page web app (Next.js). No auth.

**Success metrics (Phase 1):**

- Able to generate and store a course from an input topic.
- Able to view the course and all lessons in the UI.
- Deployable to Vercel.

---

# Phases

## Phase 1 — Core (MVP)

**Backend**

- Endpoint: `POST /api/generate-course` — accepts `{ topic: string }` returns generated course object.
- Endpoint: `GET /api/courses` — list last N generated courses.
- Endpoint: `GET /api/courses/:id` — retrieve course + lessons.
- Database: minimal `courses` and `lessons` tables in Supabase.

**Frontend**

- Single page app with:
    - Topic input box + "Generate" button
    - Course viewer (title, description, lesson list)
    - Lesson viewer (expand/collapse)
- No auth, no editing, no progress persistence to backend.
- Save course ID in local storage for quick re-open.

**Data flow**

1. User types topic → frontend calls `POST /api/generate-course`.
2. Backend calls AI (ChatGPT/Gemini/etc) to produce structured JSON (course + lessons).
3. Backend writes to Supabase `courses` and `lessons`.
4. Backend returns created course ID.
5. Frontend fetches `GET /api/courses/:id` and renders.

---

## Phase 2 — Stickiness (optional after Phase 1 validation)

- Local progress tracking (localStorage `progress.${courseId}` with completed lesson IDs)
- "Continue where you left" using saved courseId and progress in localStorage
- Small UI additions: "Mark lesson as complete", basic metrics (time spent, lessons completed)

---

## Phase 3 — Auth & Persistence

- Add Supabase Auth (email magic link) and `users` table if needed
- Persist progress server-side in `progress` table linking user_id + course_id + lesson_id
- Course list per user

---

## Phase 4 — Course Editor & User-created Content

- Course editor UI to create/modify lessons
- Endpoint: `POST /api/courses` (create), `PUT /api/courses/:id` (update)
- Permission checks (owner-only edits)

---

## Phase 5 — Assessments & Validation

- Generate quizzes per lesson via AI
- `assessments` table: questions + answers + scoring
- Track assessment attempts & release simple certificate on completion

---

# Database Schema (Supabase / Postgres)

### `courses`

```sql
CREATE TABLE courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  topic text,
  generated_by text, -- e.g. 'ai' or 'user'
  ai_prompt jsonb, -- store prompt for reproducibility
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

```

### `lessons`

```sql
CREATE TABLE lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
  order integer NOT NULL,
  title text NOT NULL,
  content text, -- markdown or html
  summary text,
  duration_minutes integer, -- estimated
  created_at timestamptz DEFAULT now()
);

```

### Optional later: `users`

- Use Supabase Auth; user metadata stored in `auth.users` + `profiles` table if needed.

### Optional later: `progress`

```sql
CREATE TABLE progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  course_id uuid REFERENCES courses(id),
  lesson_id uuid REFERENCES lessons(id),
  completed boolean DEFAULT false,
  completed_at timestamptz
);

```

### Optional later: `assessments`

```sql
CREATE TABLE assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid REFERENCES lessons(id),
  payload jsonb,
  created_at timestamptz DEFAULT now()
);

```

---

# API Spec (minimal)

### `POST /api/generate-course`

**Request**

```json
{ "topic": "Learn Rust for web backend" }

```

**Response (success)**

```json
{
  "course": {
    "id": "...",
    "title": "Rust for Web Backends — Beginner",
    "description": "A 5-lesson course to go from 0 to 1",
    "lessons": [ { "order":1, "title":"...", "content":"..." }, ... ]
  }
}

```

**Server responsibilities**

- Validate input
- Build AI prompt (store it in `ai_prompt`)
- Call AI, parse structured JSON
- Persist `courses` and `lessons`
- Return course ID and minimal data

### `GET /api/courses`

- Returns list of recent/featured courses (id, title, description, created_at)

### `GET /api/courses/:id`

- Returns course with nested lessons ordered by `order`

### `POST /api/courses` (Phase 4)

- Create course from user input (owner field) — requires auth

### `PUT /api/courses/:id` (Phase 4)

- Update course — requires auth & ownership

---

# AI Prompting (practical)

**Goal:** produce deterministic JSON with course + lessons.

**Prompt skeleton (backend constructs dynamically):**

```
You are an expert teacher. Given topic: "{topic}", produce a beginner course that takes someone from 0 to 1.
Return ONLY JSON in this exact shape:
{
  "title": "...",
  "description": "...",
  "lessons": [
    {"order": 1, "title": "...", "summary":"...", "content": "...", "duration_minutes": 10},
    ...
  ]
}
Make lessons practical and concise. Use plain markdown in content. Prefer 3–7 lessons for a beginner course.

```

Store the full prompt and model response in `courses.ai_prompt` for reproducibility.

---

# Frontend — Minimal UI Components (Next.js / React)

**Pages/Components**

- `/` — Home / generator
    - `TopicInput` component
    - `GenerateButton`
    - `RecentCourses` list (calls `GET /api/courses`)
- `/course/[id]` — Course viewer
    - `CourseHeader` (title, description)
    - `LessonList` (collapsible items)
    - `Lesson` (title, content, mark complete)

**Local storage keys**

- `lastCourseId` — last generated course id
- `progress.{courseId}` — JSON `{ completedLessonIds: [] }`

**Minimal UX details**

- Show a loading skeleton while generating
- Keep content as markdown — render with a markdown component
- Make lessons toggleable; remember last open lesson in local storage

---

# Example Next.js API pseudocode (serverless handler)

```
// POST /api/generate-course
export default async function handler(req,res){
  const { topic } = req.body;
  // 1. Build prompt
  const prompt = buildPrompt(topic);
  // 2. Call AI
  const aiResponse = await callAI(prompt);
  // 3. Parse and validate JSON
  const courseJson = JSON.parse(aiResponse);
  // 4. Write course + lessons to Supabase
  const { data: course } = await supabase
    .from('courses')
    .insert({ title: courseJson.title, description: courseJson.description, topic, generated_by:'ai', ai_prompt: prompt })
    .select('*')
    .single();
  // insert lessons
  await Promise.all(courseJson.lessons.map(l => supabase.from('lessons').insert({ ... })))
  // 5. return course id
  res.json({ course: { id: course.id } })
}

```

---

# Acceptance Criteria & Checklist (Phase 1)

- [ ]  `POST /api/generate-course` returns `course.id` and persists rows in `courses` and `lessons`.
- [ ]  `/` page allows entering topic and pressing Generate, which creates a course and navigates to `/course/:id`.
- [ ]  `/course/:id` renders course + lessons with markdown content.
- [ ]  Recent courses list shows latest 10 generated courses.
- [ ]  Application deploys to Vercel and uses environment variables for AI keys and Supabase keys.

---

# Developer Handoff Notes

- Keep the AI prompt editable in the codebase (config or admin env var) for quick iteration.
- Rate-limit generation calls and add a simple captcha or throttle (to avoid cost blowup).
- Log raw AI responses to a secure audit table for debugging.
- Use feature flags for switching model providers (OpenAI/Gemini/Local LLM).

---

# Next actions (what I can do for you now)

- Provide exact SQL migrations for Supabase.
- Generate the Next.js page + API handlers skeleton.
- Create the AI prompt templates with multiple variants (short/long/quiz-enabled).