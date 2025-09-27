import React from 'react';
import { Button } from '@/components/ui/button';

const GenerateButton = ({ onClick, loading }) => (
  <Button
    onClick={onClick}
    disabled={loading}
    className="w-full sm:w-auto px-6 py-3 rounded-lg text-white font-semibold bg-gradient-to-r from-blue-500 to-purple-500 text-base"
  >
    {loading ? 'Generating...' : 'Generate Course'}
  </Button>
);

export default GenerateButton;