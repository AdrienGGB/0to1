
import React from 'react';

const GenerateButton = ({ onClick, loading }) => (
  <button
    onClick={onClick}
    disabled={loading}
    style={{
      width: '100%',
      padding: '15px',
      fontSize: '18px',
      backgroundColor: loading ? '#ccc' : '#0070f3',
      color: 'white',
      border: 'none',
      borderRadius: '5px',
      cursor: loading ? 'not-allowed' : 'pointer',
      transition: 'background-color 0.3s ease',
    }}
  >
    {loading ? 'Generating...' : 'Generate Course'}
  </button>
);

export default GenerateButton;
