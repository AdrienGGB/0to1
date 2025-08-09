
import React from 'react';

const CourseHeader = ({ title, description }) => (
  <div style={{ marginBottom: '40px' }}>
    <h1 style={{ fontSize: '32px', marginBottom: '10px' }}>{title}</h1>
    <p style={{ fontSize: '18px', color: '#555' }}>{description}</p>
  </div>
);

export default CourseHeader;
