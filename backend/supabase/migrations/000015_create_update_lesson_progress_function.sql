CREATE OR REPLACE FUNCTION update_lesson_progress(
  p_user_id uuid,
  p_course_id uuid,
  p_lesson_id uuid,
  p_completed boolean
)
RETURNS void AS $$
DECLARE
  current_progress jsonb;
BEGIN
  -- Get current progress for the user and course
  SELECT progress INTO current_progress
  FROM user_progress
  WHERE user_id = p_user_id AND course_id = p_course_id;

  -- Initialize if no progress exists
  IF current_progress IS NULL THEN
    current_progress := '{}'::jsonb;
  END IF;

  -- Update lesson-specific progress
  current_progress := jsonb_set(current_progress, ARRAY[p_lesson_id::text], to_jsonb(p_completed), true);

  -- Upsert the updated progress
  INSERT INTO user_progress (user_id, course_id, progress)
  VALUES (p_user_id, p_course_id, current_progress)
  ON CONFLICT (user_id, course_id) DO UPDATE
  SET progress = EXCLUDED.progress, updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;