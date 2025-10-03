CREATE TABLE public.user_courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  course_id uuid REFERENCES public.courses(id),
  enrolled_at timestamptz DEFAULT now(),
  progress integer DEFAULT 0 CHECK (progress >= 0 AND progress <= 100)
);