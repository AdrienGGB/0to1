
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
    <div style={{ marginTop: '60px' }}>
      <h2 style={{ fontSize: '24px', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
        Recent Courses
      </h2>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
        {courses.map(course => (
          <Link key={course.id} href={`/course/${course.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{ border: '1px solid #eee', borderRadius: '8px', padding: '20px', transition: 'box-shadow 0.3s ease', cursor: 'pointer' }}>
              <h3 style={{ fontSize: '20px', marginBottom: '10px' }}>{course.title}</h3>
              <p style={{ fontSize: '14px', color: '#666' }}>{course.description}</p>
            </div>
          </Link>
        ))}
      </div>
      {!loading && courses.length === 0 && <p>No recent courses yet.</p>}
    </div>
  );
};

export default RecentCourses;
