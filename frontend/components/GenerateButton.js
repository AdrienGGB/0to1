
import React from 'react';

const GenerateButton = ({ onClick, loading }) => (
  <button
    onClick={onClick}
    disabled={loading}
    style={{ width: '100%', padding: '12px', fontSize: '16px', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
  >
    {loading ? 'Generating...' : 'Generate Course'}
  </button>
);

export default GenerateButton;
