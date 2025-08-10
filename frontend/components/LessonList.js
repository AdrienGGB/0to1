
import React from 'react';
import Lesson from './Lesson';

const LessonList = ({ lessons }) => (
  <div>
    {lessons.sort((a, b) => a.order - b.order).map(lesson => (
      <Lesson key={lesson.order} lesson={lesson} />
    ))}
  </div>
);

export default LessonList;
