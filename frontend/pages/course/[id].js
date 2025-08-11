
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import CourseHeader from '../../components/CourseHeader';
import LessonList from '../../components/LessonList';

const CoursePage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    const fetchCourse = async () => {
      try {
        const response = await fetch(`/api/courses/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch course');
        }
        const data = await response.json();
        setCourse(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id]);

  if (loading) return <p>Loading course...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!course) return <p>Course not found.</p>;

  return (
    <div>
      <CourseHeader title={course.title} description={course.description} />
      <LessonList lessons={course.lessons} />
    </div>
  );
};

export default CoursePage;

