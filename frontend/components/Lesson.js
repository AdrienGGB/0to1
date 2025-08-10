
import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

const Lesson = ({ lesson, courseId }) => {
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const progress = JSON.parse(localStorage.getItem(`progress.${courseId}`)) || { completedLessonIds: [] };
    setIsComplete(progress.completedLessonIds.includes(lesson.id));
  }, [courseId, lesson.id]);

  const handleMarkComplete = () => {
    const progress = JSON.parse(localStorage.getItem(`progress.${courseId}`)) || { completedLessonIds: [] };
    if (!progress.completedLessonIds.includes(lesson.id)) {
      progress.completedLessonIds.push(lesson.id);
      localStorage.setItem(`progress.${courseId}`, JSON.stringify(progress));
      setIsComplete(true);
    }
  };

  return (
    <div style={{ border: '1px solid #eee', borderRadius: '4px', padding: '20px', marginBottom: '10px', backgroundColor: isComplete ? '#e8f5e9' : 'white' }}>
      <h3 style={{ fontSize: '20px', marginBottom: '10px' }}>{lesson.title}</h3>
      <ReactMarkdown>{lesson.content}</ReactMarkdown>
      <p style={{ fontSize: '14px', color: '#777', marginTop: '10px' }}>Estimated duration: {lesson.duration_minutes} minutes</p>
      <button onClick={handleMarkComplete} disabled={isComplete} style={{ marginTop: '10px', padding: '8px 12px', border: 'none', borderRadius: '4px', backgroundColor: isComplete ? '#a5d6a7' : '#0070f3', color: 'white', cursor: 'pointer' }}>
        {isComplete ? 'Completed' : 'Mark as complete'}
      </button>
    </div>
  );
};

export default Lesson;
