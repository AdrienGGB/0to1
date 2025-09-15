
import React from 'react';

const CourseHeader = ({ title, description, level }) => (
  <div style={{ marginBottom: '40px', borderBottom: '1px solid #eee', paddingBottom: '20px' }}>
    <h1 style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '10px' }}>
      {title}
      {level && (
        <span style={{
          fontSize: '16px',
          fontWeight: 'normal',
          backgroundColor: '#eee',
          color: '#333',
          padding: '5px 10px',
          borderRadius: '5px',
          marginLeft: '15px',
          verticalAlign: 'middle'
        }}>
          {level.charAt(0).toUpperCase() + level.slice(1)}
        </span>
      )}
    </h1>
    <p style={{ fontSize: '20px', color: '#666' }}>{description}</p>
  </div>
);

export default CourseHeader;
