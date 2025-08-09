
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import TopicInput from '../components/TopicInput';
import GenerateButton from '../components/GenerateButton';
import RecentCourses from '../components/RecentCourses';

export default function HomePage() {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

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
        throw new Error('Failed to generate course');
      }

      const { course } = await response.json();
      router.push(`/course/${course.id}`);
    } catch (error) {
      console.error(error);
      // You might want to show an error message to the user
    } finally {
      setLoading(false);
    }
  };

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
