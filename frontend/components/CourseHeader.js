
import React from 'react';
import { Badge } from '@/components/ui/badge';

const CourseHeader = ({ title, description, level }) => (
  <div className="mb-8 pb-4 border-b border-gray-700">
    <h1 className="text-4xl font-bold text-white mb-2">
      {title}
      {level && (
        <Badge variant="secondary" className="ml-4 align-middle">
          {level.charAt(0).toUpperCase() + level.slice(1)}
        </Badge>
      )}
    </h1>
    <p className="text-lg text-gray-300">{description}</p>
  </div>
);

export default CourseHeader;
