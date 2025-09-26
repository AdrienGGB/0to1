import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const Lesson = ({ lesson, isCompleted, onToggleComplete, onLessonSelect, isSelected, onEnhanceLesson, enhancing }) => {
  const isEnhanced = lesson.content && lesson.content.length > 0;

  return (
    <div
      className={`relative w-full border rounded-lg mb-4 overflow-hidden cursor-pointer ${isSelected ? 'bg-gray-200' : 'bg-white'}`}
      onClick={() => onLessonSelect(lesson.id)}
    >
      <Badge variant="default" className="absolute top-2 right-2 py-1 px-2 pointer-events-none bg-gray-800 text-white">{lesson.level}</Badge>
      <div className="p-4 flex justify-between items-center">
        <h3 className="text-lg font-bold">{lesson.title}</h3>
        <div className="flex items-center">
          <span className="text-sm text-gray-500 mr-4">{lesson.duration_minutes} min</span>
          <input
            type="checkbox"
            checked={isCompleted}
            onChange={onToggleComplete}
            onClick={(e) => e.stopPropagation()} // Prevent click from propagating to parent div
            className="transform scale-150"
          />
          {!isEnhanced && (
            <Button
              onClick={(e) => {
                e.stopPropagation(); // Prevent lesson selection
                onEnhanceLesson(lesson.id);
              }}
              disabled={enhancing}
              size="sm"
              className="ml-4 bg-gray-800 text-white hover:bg-gray-700"
            >
              {enhancing ? 'Enhancing...' : 'Enhance'}
            </Button>
          )}
        </div>
      </div>
      <div className="px-4 pb-4">
        <p className="text-sm text-gray-600">{lesson.summary}</p>
      </div>
    </div>
  );
};

export default Lesson;
