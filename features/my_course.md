Got it ✅ Since you’ve applied the schema changes, let’s now prepare a **detailed `.md` feature spec** for Gemini CLI so it knows how to update your codebase with the new **“My Courses”** section.

This will cover:

* New schema (with `user_courses` + `user_progress`)
* Backend updates (enroll, fetch user’s courses, track progress)
* Frontend updates (My Courses page, progress display)

Here’s the `.md` file:

---

````markdown
# Feature: My Courses Section

## Goal
Enable each authenticated user to:
1. Enroll in courses.
2. View their enrolled courses in a **"My Courses"** section.
3. Track progress at the course and lesson level.

This uses the updated database schema with `user_courses` and `user_progress`.

---

## Database Schema (already applied)

### Tables
- **courses**  
  Stores global course info (title, description, etc.).

- **lessons**  
  Stores lessons tied to courses.

- **user_courses**  
  Tracks user-course enrollment and overall progress.  
  ```sql
  user_courses (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id),
    course_id uuid REFERENCES public.courses(id),
    enrolled_at timestamptz DEFAULT now(),
    progress integer DEFAULT 0 CHECK (progress >= 0 AND progress <= 100)
  )
````

* **user\_progress**
  Tracks detailed progress per course and lesson for each user.

  ```sql
  user_progress (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    course_id uuid REFERENCES public.courses(id),
    progress jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
  )
  ```

---

## Backend Tasks

### 1. Enroll in a Course

* Add endpoint/function:

  ```ts
  async function enrollUserInCourse(userId: string, courseId: string) {
    return await supabase
      .from("user_courses")
      .insert([{ user_id: userId, course_id: courseId }]);
  }
  ```

### 2. Fetch User Courses

* Query all courses linked to the user:

  ```ts
  async function getUserCourses(userId: string) {
    return await supabase
      .from("user_courses")
      .select(`
        progress,
        enrolled_at,
        courses (
          id, title, description, topic, level, created_at
        )
      `)
      .eq("user_id", userId);
  }
  ```

### 3. Track Progress

* Update progress in `user_courses` (overall %) and `user_progress` (lesson-level JSON):

  ```ts
  async function updateLessonProgress(userId: string, courseId: string, lessonId: string, completed: boolean) {
    // Update lesson-level progress JSON
    const { data: existing } = await supabase
      .from("user_progress")
      .select("progress")
      .eq("user_id", userId)
      .eq("course_id", courseId)
      .single();

    const progress = existing?.progress || {};
    progress[lessonId] = completed;

    await supabase
      .from("user_progress")
      .upsert({ user_id: userId, course_id: courseId, progress });
  }
  ```

---

## Frontend Tasks

### 1. Add "My Courses" Page

* New route: `/my-courses`
* Fetch user’s enrolled courses with `getUserCourses(user.id)`.
* Display:

  * Course title, description
  * Enrolled date
  * Progress bar (% complete from `user_courses.progress`)

### 2. Enroll Button

* On a course detail page (`/courses/:id`), add an **"Enroll"** button.
* On click → call `enrollUserInCourse(user.id, course.id)`.

### 3. Lesson Tracking

* In the lesson viewer (`/courses/:id/lessons/:lessonId`):

  * Add a checkbox/button **"Mark as Complete"**.
  * Call `updateLessonProgress(...)`.
  * Update overall % in `user_courses`.

---

## UI Enhancements

* **Progress Bar Component**

  ```tsx
  <Progress value={progress} max={100} />
  ```
* **Empty State** (if no courses enrolled):

  > "You haven’t enrolled in any courses yet. Browse the catalog to get started."

---

## Security & RLS Policies

* Ensure RLS is enabled on `user_courses` and `user_progress`.
* Example policy:

  ```sql
  CREATE POLICY "Users can only see their own courses"
  ON user_courses FOR SELECT
  USING (auth.uid() = user_id);

  CREATE POLICY "Users can only see their own progress"
  ON user_progress FOR SELECT
  USING (auth.uid() = user_id);
  ```

---

## Deliverables

* Backend:

  * Functions for enroll, fetch, progress update
* Frontend:

  * `/my-courses` page
  * Enroll button in course detail page
  * Lesson completion tracking
* Database:

  * Ensure RLS policies applied
* UI:

  * Progress display with % bar
  * Empty state message

---

```

---
* Current SQL structure:
-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.courses (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  topic text,
  generated_by text,
  ai_prompt jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  level USER-DEFINED NOT NULL DEFAULT 'beginner'::course_level,
  CONSTRAINT courses_pkey PRIMARY KEY (id)
);
CREATE TABLE public.lessons (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  course_id uuid,
  order integer NOT NULL,
  title text NOT NULL,
  content text,
  summary text,
  duration_minutes integer,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT lessons_pkey PRIMARY KEY (id),
  CONSTRAINT lessons_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id)
);
CREATE TABLE public.user_courses (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  course_id uuid NOT NULL,
  enrolled_at timestamp with time zone DEFAULT now(),
  progress integer DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  CONSTRAINT user_courses_pkey PRIMARY KEY (id),
  CONSTRAINT user_courses_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT user_courses_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id)
);
CREATE TABLE public.user_progress (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  course_id uuid NOT NULL,
  progress jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_progress_pkey PRIMARY KEY (id),
  CONSTRAINT user_progress_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id)
);