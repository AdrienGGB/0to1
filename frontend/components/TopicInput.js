
import React from 'react';

const TopicInput = ({ value, onChange }) => (
  <input
    type="text"
    value={value}
    onChange={onChange}
    placeholder="Enter a topic to learn..."
    style={{ width: '100%', padding: '12px', fontSize: '16px', border: '1px solid #ccc', borderRadius: '4px' }}
  />
);

export default TopicInput;
