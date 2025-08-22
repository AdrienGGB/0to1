-- 000003_create_user_progress.sql
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
