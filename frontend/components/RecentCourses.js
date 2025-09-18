
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

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
    <div className="mt-12">
      <h2 className="text-2xl font-bold mb-6 border-b pb-2">
        Recent Courses
      </h2>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map(course => (
          <Link key={course.id} href={`/course/${course.id}`} className="no-underline text-inherit">
            <Card className="h-full flex flex-col">
              <CardHeader>
                <CardTitle>{course.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground mb-2">{course.description}</p>
                <p className="text-xs text-primary-foreground font-semibold">Level: {course.level}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
      {!loading && courses.length === 0 && <p>No recent courses yet.</p>}
    </div>
  );
};

export default RecentCourses;
