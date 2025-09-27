import React from 'react';
import { Input } from '@/components/ui/input';

const TopicInput = ({ value, onChange }) => (
  <Input
    type="text"
    value={value}
    onChange={onChange}
    placeholder="Enter a topic to learn..."
    className="w-full py-3 px-4 text-base"
  />
);

export default TopicInput;