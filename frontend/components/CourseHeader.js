
import React from 'react';

const CourseHeader = ({ title, description }) => (
  <div style={{ marginBottom: '40px', borderBottom: '1px solid #eee', paddingBottom: '20px' }}>
    <h1 style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '10px' }}>{title}</h1>
    <p style={{ fontSize: '20px', color: '#666' }}>{description}</p>
  </div>
);

export default CourseHeader;
