-- Initial schema for 0to1 MVP
create extension if not exists "pgcrypto";

CREATE TABLE IF NOT EXISTS courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  topic text,
  generated_by text,
  ai_prompt jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
  "order" integer NOT NULL,
  title text NOT NULL,
  content text,
  summary text,
  duration_minutes integer,
  created_at timestamptz DEFAULT now()
);
