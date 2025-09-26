
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';

const RecentCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch('/api/courses');
        if (!response.ok) {
          throw new Error('Failed to fetch courses');
        }
        const data = await response.json();
        setCourses(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  return (
    <div className="mt-12 w-full px-4">
      <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200 text-center">
        Recent Courses
      </h2>
      {loading && <p className="text-gray-800">Loading...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-4xl mx-auto">
        {courses.map(course => (
          <Link key={course.id} href={`/course/${course.id}`} className="text-gray-800 no-underline flex">
            <div className="relative flex-1 flex flex-col border border-gray-200 rounded-lg p-4 transition-shadow duration-300 ease-in-out hover:shadow-lg cursor-pointer bg-white min-w-[300px]">
              <Badge className="absolute top-2 right-2 bg-gray-800 text-white text-sm">{course.level.charAt(0).toUpperCase() + course.level.slice(1)}</Badge>
              <h3 className="text-lg font-bold mb-2 overflow-hidden text-ellipsis whitespace-nowrap">{course.title}</h3>
              <p className="text-xs text-gray-600 overflow-hidden text-ellipsis h-16">{course.description}</p>
            </div>
          </Link>
        ))}
      </div>
      {!loading && courses.length === 0 && <p className="text-gray-800 text-center">No recent courses yet.</p>}
    </div>
  );
};

export default RecentCourses;
