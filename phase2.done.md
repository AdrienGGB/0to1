Great — here’s a clear, **step-by-step backend plan** you can implement right now to add persistent, server-side progress storage **without doing auth yet**.
We'll treat `user_id` as a client-generated identifier (an anonymous UUID that the front-end stores in `localStorage`) so users can resume from anywhere. After this backend is in place we’ll switch back to the front-end integration.

---

## Summary of what we’ll add

1. A new Supabase migration that creates `user_progress` table (JSONB progress, per `user_id` + `course_id` unique).
2. Server API endpoints (Next.js-style serverless handlers) to **save**, **get**, **list**, and **delete** progress.
3. Merge/merge-strategy logic on save (handle offline / multiple clients reasonably).
4. Example cURL tests and commands to run the migration.

---

## 1) Migration (SQL) — file path

Create a migration SQL file at:

```
backend/supabase/migrations/000002_create_user_progress.sql
```

Contents:

```sql
-- 000002_create_user_progress.sql
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS user_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL, -- client-generated or later will map to auth.user
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  progress jsonb NOT NULL DEFAULT '{}'::jsonb,
  -- progress JSON shape: {
  --   version: 1,
  --   completedLessonIds: ["id1","id2"],
  --   lastLessonId: "id3",
  --   lessonTimes: { "lessonId": seconds, ... },
  --   timeSpentSeconds: 123
  -- }
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- keep a uniqueness constraint per user+course (makes upsert easy)
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_course ON user_progress (user_id, course_id);
```

**How to apply**
From `backend/` (Supabase CLI should be installed and linked to your project):

```bash
cd backend
# ensure supabase CLI logged in and linked
export SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
supabase db push
```

Or run `supabase db reset` / `supabase start` as per your dev flow. The important part: the SQL file should be in `supabase/migrations/` so `supabase db push` picks it up.

---

## 2) API endpoints — design & payloads

We’ll add 4 simple endpoints (put them under `backend/api/` or in your Next.js `pages/api/` or `app/api/` depending on setup). I’ll give Next.js-compatible TypeScript handlers.

**Environment variables required (server-side)**
Add to `.env.example` (or `.env.local` for local dev):

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Use the **service role key** on server only (never expose in client).

---

### A. `POST /api/progress/save`

**Purpose:** save or merge progress for `userId` + `courseId`.
**Request (JSON)**:

```json
{
  "userId": "anon-uuid-from-client",
  "courseId": "course-uuid",
  "progress": {
    "version":1,
    "completedLessonIds":["l1","l2"],
    "lastLessonId":"l2",
    "lessonTimes": { "l1": 30, "l2": 120 },
    "timeSpentSeconds": 150
  },
  "clientUpdatedAt": "2025-08-12T20:00:00.000Z" // optional ISO timestamp from client
}
```

**Behavior / merge strategy (server):**

* Look up existing row for `userId+courseId`.
* Merge `completedLessonIds` = union(existing, incoming).
* Merge `lessonTimes` per lesson: keep `max(existing, incoming)` for each lessonId (avoids double-counting).
* Recompute `timeSpentSeconds` as `sum(Object.values(mergedLessonTimes))`.
* Choose `lastLessonId` from the side (existing vs incoming) whose `clientUpdatedAt` is newest; if not provided, prefer incoming's `lastLessonId`.
* Upsert merged result into `user_progress` and return the merged progress.

**Server code (Next.js handler)** — save as:
`backend/api/progress/save.ts`

```ts
// FILE: backend/api/progress/save.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

type ProgressPayload = {
  version: number;
  completedLessonIds: string[];
  lastLessonId?: string;
  lessonTimes?: Record<string, number>;
  timeSpentSeconds?: number;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { userId, courseId, progress, clientUpdatedAt } = req.body as {
    userId: string;
    courseId: string;
    progress: ProgressPayload;
    clientUpdatedAt?: string;
  };

  if (!userId || !courseId || !progress) return res.status(400).json({ error: 'Missing fields' });

  try {
    const { data: existingRows } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .limit(1);

    const existing = existingRows && existingRows[0] ? existingRows[0] : null;

    // parse existing progress
    const existingProgress = existing?.progress ?? { version: 1, completedLessonIds: [], lessonTimes: {}, timeSpentSeconds: 0 };

    // merge completedLessonIds (union)
    const existingSet = new Set(existingProgress.completedLessonIds || []);
    (progress.completedLessonIds || []).forEach((id: string) => existingSet.add(id));
    const mergedCompletedLessonIds = Array.from(existingSet);

    // merge lessonTimes: take max per lesson
    const mergedLessonTimes: Record<string, number> = { ...(existingProgress.lessonTimes || {}) };
    for (const [lessonId, secs] of Object.entries(progress.lessonTimes || {})) {
      mergedLessonTimes[lessonId] = Math.max(mergedLessonTimes[lessonId] || 0, secs || 0);
    }

    // recompute total time as sum of lesson times
    const mergedTimeSpentSeconds = Object.values(mergedLessonTimes).reduce((a, b) => a + b, 0);

    // decide lastLessonId: prefer the most recent clientUpdatedAt if provided, otherwise incoming
    let mergedLastLessonId = existingProgress.lastLessonId;
    if (clientUpdatedAt) {
      const clientTs = Date.parse(clientUpdatedAt);
      const serverTs = existing?.updated_at ? Date.parse(existing.updated_at) : 0;
      if (clientTs >= serverTs) mergedLastLessonId = progress.lastLessonId ?? mergedLastLessonId;
    } else {
      mergedLastLessonId = progress.lastLessonId ?? mergedLastLessonId;
    }

    const mergedProgress = {
      version: 1,
      completedLessonIds: mergedCompletedLessonIds,
      lessonTimes: mergedLessonTimes,
      timeSpentSeconds: mergedTimeSpentSeconds,
      lastLessonId: mergedLastLessonId,
    };

    // upsert (insert or update)
    const payloadRow = {
      user_id: userId,
      course_id: courseId,
      progress: mergedProgress,
    };

    const { error: upsertError } = await supabase
      .from('user_progress')
      .upsert(payloadRow, { onConflict: ['user_id', 'course_id'], returning: 'representation' });

    if (upsertError) throw upsertError;

    return res.status(200).json({ progress: mergedProgress });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: err.message || String(err) });
  }
}
```

---

### B. `GET /api/progress` (single)

**Purpose:** fetch saved progress for a given `userId` and `courseId`.
**Query params:** `GET /api/progress?userId=...&courseId=...`
**Response:** `{ progress: {...} }` or `{ progress: null }`

Handler file: `backend/api/progress/get.ts`

```ts
// FILE: backend/api/progress/get.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId, courseId } = req.query as { userId?: string; courseId?: string };
  if (!userId || !courseId) return res.status(400).json({ error: 'Missing query params' });

  const { data, error } = await supabase
    .from('user_progress')
    .select('progress')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .single();

  if (error && error.code === 'PGRST116') return res.status(404).json({ progress: null });

  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ progress: data?.progress ?? null });
}
```

---

### C. `GET /api/progress/list` (all courses for a user)

**Purpose:** list all saved progress rows for a `userId`.
**Query params:** `GET /api/progress/list?userId=...`
**Response:** `{ items: [ { course_id, progress, updated_at }, ... ] }`

Handler: `backend/api/progress/list.ts` — similar to above, returns list.

---

### D. `DELETE /api/progress` (optional)

Delete/reset progress for a user/course:
`DELETE /api/progress?userId=...&courseId=...`

---

## 3) Testing the endpoints (curl examples)

**Save progress**

```bash
curl -X POST "http://localhost:3000/api/progress/save" \
 -H "Content-Type: application/json" \
 -d '{
   "userId":"anon-123-uuid",
   "courseId":"<course-uuid>",
   "progress": {
     "version":1,
     "completedLessonIds":["l1"],
     "lastLessonId":"l1",
     "lessonTimes": {"l1": 12},
     "timeSpentSeconds": 12
   },
   "clientUpdatedAt":"2025-08-12T20:00:00.000Z"
 }'
```

**Get progress**

```bash
curl "http://localhost:3000/api/progress?userId=anon-123-uuid&courseId=<course-uuid>"
```

**List progress**

```bash
curl "http://localhost:3000/api/progress/list?userId=anon-123-uuid"
```

---

## 4) Security & operational notes (important)

* **No auth yet:** this is fine for early MVP testing. But anyone with a `userId` string could read/write that user’s progress. To reduce abuse:

  * Prefer long, hard-to-guess `userId` (UUIDv4) generated in client and stored locally.
  * Rate-limit the API (per IP / per userId) to avoid spam or replay attacks.
  * Add a simple CAPTCHA on actions that create many requests.
* **Service role key:** must only be used server-side. Don’t expose it to the browser.
* **Validation:** always validate incoming `progress` shape on the server to avoid injection of malicious content in JSONB.
* **Logging:** keep an audit log (optionally `user_progress_history` table) for debugging merges if users report inconsistencies.

---

## 5) Next steps (frontend sync plan — summary)

Once backend endpoints are live, the front-end flow will be:

1. On app load, generate or read `anonUserId` from `localStorage` (if not present, create `crypto.randomUUID()`).
2. After loading a course, call `GET /api/progress?userId=...&courseId=...` and hydrate local state from server result.
3. Continue to track progress locally (hooks from the Phase 2 plan). Every X seconds or on lesson completion/unload call `POST /api/progress/save` to sync.
4. When offline, keep saving locally and retry sync when online.

I’ll prepare the concrete front-end hook + UI integration next (the code will use these endpoints). Want me to implement the backend API files now and push them to your repo, or do you prefer to paste them yourself?
