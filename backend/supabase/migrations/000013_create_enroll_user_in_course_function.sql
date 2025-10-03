CREATE OR REPLACE FUNCTION enroll_user_in_course(p_user_id uuid, p_course_id uuid)
RETURNS void AS $$
BEGIN
  INSERT INTO user_courses (user_id, course_id)
  VALUES (p_user_id, p_course_id)
  ON CONFLICT (user_id, course_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;