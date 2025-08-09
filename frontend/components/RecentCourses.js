
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
    <div style={{ marginTop: '40px' }}>
      <h2 style={{ fontSize: '20px', marginBottom: '10px' }}>Recent Courses</h2>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      {courses.length > 0 ? (
        <ul>
          {courses.map(course => (
            <li key={course.id} style={{ marginBottom: '10px' }}>
              <Link href={`/course/${course.id}`}>
                <a style={{ textDecoration: 'none', color: '#0070f3' }}>{course.title}</a>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        !loading && <p>No recent courses yet.</p>
      )}
    </div>
  );
};

export default RecentCourses;
