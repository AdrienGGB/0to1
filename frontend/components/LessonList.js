
import React from 'react';
import Lesson from './Lesson';

const LessonList = ({ lessons, courseId }) => (
  <div>
    {lessons.sort((a, b) => a.order - b.order).map(lesson => (
      <Lesson key={lesson.order} lesson={lesson} courseId={courseId} />
    ))}
  </div>
);

export default LessonList;
