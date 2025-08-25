-- Migration: 000004_consolidated_schema.sql
-- Description: Consolidated schema migration capturing current database state
-- Date: 2024-01-XX

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create courses table
CREATE TABLE IF NOT EXISTS "public"."courses" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "topic" "text",
    "generated_by" "text",
    "ai_prompt" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);

-- Create lessons table
CREATE TABLE IF NOT EXISTS "public"."lessons" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "course_id" "uuid",
    "order" integer NOT NULL,
    "title" "text" NOT NULL,
    "content" "text",
    "summary" "text",
    "duration_minutes" integer,
    "created_at" timestamp with time zone DEFAULT "now"()
);

-- Create user_progress table
CREATE TABLE IF NOT EXISTS "public"."user_progress" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "text" NOT NULL,
    "course_id" "uuid" NOT NULL,
    "progress" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);

-- Add primary key constraints (only if they don't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'courses_pkey') THEN
        ALTER TABLE "public"."courses" ADD CONSTRAINT "courses_pkey" PRIMARY KEY ("id");
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'lessons_pkey') THEN
        ALTER TABLE "public"."lessons" ADD CONSTRAINT "lessons_pkey" PRIMARY KEY ("id");
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_progress_pkey') THEN
        ALTER TABLE "public"."user_progress" ADD CONSTRAINT "user_progress_pkey" PRIMARY KEY ("id");
    END IF;
END $$;

-- Add unique constraints
CREATE UNIQUE INDEX IF NOT EXISTS "idx_user_course" ON "public"."user_progress" USING "btree" ("user_id", "course_id");

-- Add foreign key constraints (only if they don't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'lessons_course_id_fkey') THEN
        ALTER TABLE "public"."lessons" ADD CONSTRAINT "lessons_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_progress_course_id_fkey') THEN
        ALTER TABLE "public"."user_progress" ADD CONSTRAINT "user_progress_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE CASCADE;
    END IF;
END $$;

-- Create or replace the create_course_with_lessons function
CREATE OR REPLACE FUNCTION "public"."create_course_with_lessons"(
    "course_title" "text",
    "course_description" "text", 
    "course_topic" "text",
    "course_ai_prompt" "jsonb",
    "lessons_data" "jsonb"
) RETURNS "uuid"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  new_course_id uuid;
  lesson jsonb;
BEGIN
  -- Insert the course and get the new ID
  INSERT INTO courses (title, description, topic, ai_prompt, generated_by)
  VALUES (course_title, course_description, course_topic, course_ai_prompt, 'ai')
  RETURNING id INTO new_course_id;

  -- Loop through the lessons and insert them
  FOR lesson IN SELECT * FROM jsonb_array_elements(lessons_data)
  LOOP
    INSERT INTO lessons (course_id, "order", title, content, summary, duration_minutes)
    VALUES (
      new_course_id,
      (lesson->>'order')::integer,
      lesson->>'title',
      lesson->>'content',
      lesson->>'summary',
      (lesson->>'duration_minutes')::integer
    );
  END LOOP;

  -- Return the new course ID
  RETURN new_course_id;
END;
$$;

-- Set table ownership
ALTER TABLE "public"."courses" OWNER TO "postgres";
ALTER TABLE "public"."lessons" OWNER TO "postgres";
ALTER TABLE "public"."user_progress" OWNER TO "postgres";
ALTER FUNCTION "public"."create_course_with_lessons"("course_title" "text", "course_description" "text", "course_topic" "text", "course_ai_prompt" "jsonb", "lessons_data" "jsonb") OWNER TO "postgres";

-- Grant permissions
GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

GRANT ALL ON FUNCTION "public"."create_course_with_lessons"("course_title" "text", "course_description" "text", "course_topic" "text", "course_ai_prompt" "jsonb", "lessons_data" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."create_course_with_lessons"("course_title" "text", "course_description" "text", "course_topic" "text", "course_ai_prompt" "jsonb", "lessons_data" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_course_with_lessons"("course_title" "text", "course_description" "text", "course_topic" "text", "course_ai_prompt" "jsonb", "lessons_data" "jsonb") TO "service_role";

GRANT ALL ON TABLE "public"."courses" TO "anon";
GRANT ALL ON TABLE "public"."courses" TO "authenticated";
GRANT ALL ON TABLE "public"."courses" TO "service_role";

GRANT ALL ON TABLE "public"."lessons" TO "anon";
GRANT ALL ON TABLE "public"."lessons" TO "authenticated";
GRANT ALL ON TABLE "public"."lessons" TO "service_role";

GRANT ALL ON TABLE "public"."user_progress" TO "anon";
GRANT ALL ON TABLE "public"."user_progress" TO "authenticated";
GRANT ALL ON TABLE "public"."user_progress" TO "service_role";

-- Set default privileges
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";
