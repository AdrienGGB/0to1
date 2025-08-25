import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import TopicInput from '../components/TopicInput';
import GenerateButton from '../components/GenerateButton';
import RecentCourses from '../components/RecentCourses';
import { useUser } from '@supabase/auth-helpers-react';

export default function HomePage() {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const user = useUser();

  useEffect(() => {
    if (!user) {
      router.push('/auth');
    }
  }, [user, router]);

  const handleGenerate = async () => {
    if (!topic) return;
    setLoading(true);
    try {
      const response = await fetch('/api/generate-course', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to generate course: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      const { course } = data;

      // Trigger lesson enhancement for each lesson in the generated course
      if (course && course.lessons) {
        course.lessons.forEach(async (lesson) => {
          try {
            await fetch('/api/enhance-lesson', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ lessonId: lesson.id, courseId: course.id }),
            });
            // No need to wait for each enhancement to complete before redirecting
          } catch (enhanceError) {
            console.error(`Failed to enhance lesson ${lesson.id}:`, enhanceError);
            // Handle error, maybe log it or update UI to show partial failure
          }
        });
      }

      router.push(`/course/${course.id}`);
    } catch (error) {
      // For the user, we can show a notification
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <p>Redirecting to authentication...</p>;
  }

  return (
    <div style={{ maxWidth: '600px', margin: 'auto', padding: '40px 20px', fontFamily: 'sans-serif' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '40px', fontSize: '32px' }}>0to1: AI Learning Assistant</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <TopicInput value={topic} onChange={(e) => setTopic(e.target.value)} />
        <GenerateButton onClick={handleGenerate} loading={loading} />
      </div>
      <RecentCourses />
    </div>
  );
}