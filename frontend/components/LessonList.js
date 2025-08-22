import React from 'react';
import Lesson from './Lesson';

const LessonList = ({ lessons, progress, onSaveProgress, onLessonTimeUpdate, onLessonSelect, selectedLessonId, onEnhanceLesson, enhancing }) => (
  <div>
    {lessons.sort((a, b) => a.order - b.order).map(lesson => (
      <Lesson
        key={lesson.id}
        lesson={lesson}
        isCompleted={progress.completedLessonIds.includes(lesson.id)}
        onToggleComplete={() => {
          const completedLessonIds = progress.completedLessonIds.includes(lesson.id)
            ? progress.completedLessonIds.filter(id => id !== lesson.id)
            : [...progress.completedLessonIds, lesson.id];
          onSaveProgress({ completedLessonIds, lastLessonId: lesson.id });
        }}
        onLessonTimeUpdate={onLessonTimeUpdate}
        onLessonSelect={onLessonSelect}
        isSelected={selectedLessonId === lesson.id}
        onEnhanceLesson={onEnhanceLesson} // Pass onEnhanceLesson
        enhancing={enhancing === lesson.id}
      />
    ))}
  </div>
);

export default LessonList;
