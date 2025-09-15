import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import TopicInput from '../components/TopicInput';
import GenerateButton from '../components/GenerateButton';
import RecentCourses from '../components/RecentCourses';
import { createClient } from '@/utils/supabase/client';

function HomePage() {
  const [topic, setTopic] = useState('');
  const [level, setLevel] = useState('beginner');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [user, setUser] = useState(null); // New state for user
  const [sessionLoaded, setSessionLoaded] = useState(false); // New state to track session loading
  const supabase = createClient(); // Create client-side Supabase instance

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      setSessionLoaded(true);
    };
    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
    if (sessionLoaded && !user) {
      router.push('/auth');
    }
  }, [sessionLoaded, user, router]);

  const handleGenerate = async () => {
    if (!topic) return;
    setLoading(true);
    try {
      const response = await fetch('/api/generate-course', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, level }),
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

  if (!sessionLoaded || !user) { // Check sessionLoaded before rendering
    return <p>Redirecting to authentication...</p>;
  }

  return (
    <div style={{ maxWidth: '600px', margin: 'auto', padding: '40px 20px', fontFamily: 'sans-serif' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '40px', fontSize: '32px' }}>0to1: AI Learning Assistant</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <TopicInput value={topic} onChange={(e) => setTopic(e.target.value)} />
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '10px' }}>
          <label>
            <input type="radio" value="beginner" checked={level === 'beginner'} onChange={() => setLevel('beginner')} />
            Beginner
          </label>
          <label>
            <input type="radio" value="intermediate" checked={level === 'intermediate'} onChange={() => setLevel('intermediate')} />
            Intermediate
          </label>
          <label>
            <input type="radio" value="expert" checked={level === 'expert'} onChange={() => setLevel('expert')} />
            Expert
          </label>
        </div>
        <GenerateButton onClick={handleGenerate} loading={loading} />
      </div>
      <RecentCourses />
    </div>
  );
}

export default HomePage;