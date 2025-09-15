-- Migration: 000006_add_level_to_courses.sql
-- Description: Add level to courses table

CREATE TYPE course_level AS ENUM ('beginner', 'intermediate', 'expert');

ALTER TABLE "public"."courses"
ADD COLUMN "level" course_level NOT NULL DEFAULT 'beginner';
