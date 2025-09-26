
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

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
    <div className="mt-12 w-full">
      <h2 className="text-2xl font-bold text-white mb-4 pb-2 border-b border-gray-700">
        Recent Courses
      </h2>
      {loading && <p className="text-white">Loading...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map(course => (
          <Link key={course.id} href={`/course/${course.id}`} className="text-white no-underline">
            <div className="border border-gray-700 rounded-lg p-4 transition-shadow duration-300 ease-in-out hover:shadow-lg cursor-pointer bg-gray-800">
              <h3 className="text-xl font-bold mb-2">{course.title}</h3>
              <p className="text-sm text-gray-400">{course.description}</p>
            </div>
          </Link>
        ))}
      </div>
      {!loading && courses.length === 0 && <p className="text-white">No recent courses yet.</p>}
    </div>
  );
};

export default RecentCourses;
