import React from 'react';

const Lesson = ({ lesson, isCompleted, onToggleComplete, onLessonSelect, isSelected, onEnhanceLesson, enhancing }) => {
  const isEnhanced = lesson.content && lesson.content.length > 0;

  return (
    <div
      style={{
        border: '1px solid #eee',
        borderRadius: '8px',
        marginBottom: '15px',
        overflow: 'hidden',
        backgroundColor: isSelected ? '#e0f7fa' : (isCompleted ? '#e6ffe6' : (isEnhanced ? '#f9f9f9' : '#fff9e6')),
        cursor: 'pointer',
      }}
      onClick={() => onLessonSelect(lesson.id)}
    >
      <div
        style={{
          padding: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <h3 style={{ fontSize: '22px', margin: 0 }}>{lesson.title}</h3>
        <div style={{ display: 'flex',
          alignItems: 'center' }}>
          <span style={{ fontSize: '14px', color: '#777', marginRight: '10px' }}>{lesson.duration_minutes} min</span>
          <input
            type="checkbox"
            checked={isCompleted}
            onChange={onToggleComplete}
            onClick={(e) => e.stopPropagation()} // Prevent click from propagating to parent div
            style={{ transform: 'scale(1.5)' }}
          />
          {!isEnhanced && (
            <button
              onClick={(e) => {
                e.stopPropagation(); // Prevent lesson selection
                onEnhanceLesson(lesson.id);
              }}
              style={{ marginLeft: '10px', padding: '5px 10px', cursor: 'pointer' }}
              disabled={enhancing}
            >
              {enhancing ? 'Enhancing...' : 'Enhance'}
            </button>
          )}
        </div>
      </div>
      <div style={{ padding: '0 20px 20px 20px' }}>
        <p style={{ fontSize: '16px', color: '#555', marginBottom: '0' }}>{lesson.summary}</p>
      </div>
    </div>
  );
};

export default Lesson;
