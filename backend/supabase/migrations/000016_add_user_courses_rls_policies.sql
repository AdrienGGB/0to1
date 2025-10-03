ALTER TABLE user_courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only see their own courses"
ON user_courses FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own courses"
ON user_courses FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own courses"
ON user_courses FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own courses"
ON user_courses FOR DELETE
USING (auth.uid() = user_id);

ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only see their own progress"
ON user_progress FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress"
ON user_progress FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
ON user_progress FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own progress"
ON user_progress FOR DELETE
USING (auth.uid() = user_id);