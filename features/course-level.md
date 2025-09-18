Title

Add “Course Level” Selection & Difficulty Scaling

Goal

Allow users to choose Beginner, Intermediate, or Expert level before a course is generated.
The selected level controls lesson depth, length, and complexity.

High-Level Steps

Database

Add column level (ENUM('beginner','intermediate','expert')) to courses table.

Optional: add estimated_duration column to store computed lesson length.

Backend API

Extend POST /api/courses/create to accept level.

Pass level to the LLM prompt when generating lessons.

When retrieving a course (GET /api/courses/:id), return level.

Prompting / Lesson Generation

Update Gemini/DeepSeek prompt to include:

Level: {beginner|intermediate|expert}
Requirements:
  - Beginner: short, introductory lessons, simple examples.
  - Intermediate: medium length, adds best practices and light theory.
  - Expert: in-depth analysis, edge cases, complex exercises.


Adjust lesson count and complexity based on level (e.g., 5 vs. 8 vs. 12 lessons).

Frontend

Home Page / Course Creator

Add a 3-option selector (radio buttons or segmented control).

Default to “Beginner.”

Course View

Display the selected level in the header (e.g., badge or colored label).

Testing

Create a test course for each level and verify:

Correct level saved in DB.

Lesson count and complexity vary as intended.