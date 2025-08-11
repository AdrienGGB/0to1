
import React from 'react';

const TopicInput = ({ value, onChange }) => (
  <input
    type="text"
    value={value}
    onChange={onChange}
    placeholder="Enter a topic to learn..."
    style={{
      width: '100%',
      padding: '15px',
      fontSize: '18px',
      border: '1px solid #ccc',
      borderRadius: '5px',
      transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
    }}
  />
);

export default TopicInput;
