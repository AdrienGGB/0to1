
import React, { useState } from 'react';

const Lesson = ({ lesson }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{ border: '1px solid #eee', borderRadius: '8px', marginBottom: '15px', overflow: 'hidden' }}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: '20px',
          cursor: 'pointer',
          backgroundColor: '#f9f9f9',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <h3 style={{ fontSize: '22px', margin: 0 }}>{lesson.title}</h3>
        <span style={{ fontSize: '14px', color: '#777' }}>{lesson.duration_minutes} min</span>
      </div>
      {isOpen && (
        <div style={{ padding: '20px' }}>
          <p style={{ fontSize: '16px', color: '#555', marginBottom: '15px' }}>{lesson.summary}</p>
          <div style={{ fontSize: '16px', lineHeight: '1.6' }} dangerouslySetInnerHTML={{ __html: lesson.content }} />
        </div>
      )}
    </div>
  );
};

export default Lesson;
