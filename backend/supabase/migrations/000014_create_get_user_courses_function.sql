CREATE OR REPLACE FUNCTION get_user_courses(p_user_id uuid)
RETURNS TABLE (
  progress integer,
  enrolled_at timestamptz,
  course_id uuid,
  course_title text,
  course_description text,
  course_topic text,
  course_level course_level,
  course_created_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    uc.progress,
    uc.enrolled_at,
    c.id,
    c.title,
    c.description,
    c.topic,
    c.level,
    c.created_at
  FROM user_courses uc
  JOIN courses c ON uc.course_id = c.id
  WHERE uc.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;