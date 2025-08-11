
CREATE OR REPLACE FUNCTION create_course_with_lessons(
  course_title text,
  course_description text,
  course_topic text,
  course_ai_prompt jsonb,
  lessons_data jsonb
) RETURNS uuid AS $$
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
$$ LANGUAGE plpgsql;
