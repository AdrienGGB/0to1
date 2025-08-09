
import React from 'react';

const Lesson = ({ lesson }) => (
  <div style={{ border: '1px solid #eee', borderRadius: '4px', padding: '20px', marginBottom: '10px' }}>
    <h3 style={{ fontSize: '20px', marginBottom: '10px' }}>{lesson.title}</h3>
    <p>{lesson.content}</p>
    <p style={{ fontSize: '14px', color: '#777', marginTop: '10px' }}>Estimated duration: {lesson.duration_minutes} minutes</p>
  </div>
);

export default Lesson;
