
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import TopicInput from '../components/TopicInput';
import GenerateButton from '../components/GenerateButton';
import RecentCourses from '../components/RecentCourses';

const LogViewer = ({ logs }) => (
  <div style={{ marginTop: '40px', padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '4px', fontFamily: 'monospace', whiteSpace: 'pre-wrap', border: '1px solid #eee' }}>
    <h3 style={{ marginTop: 0 }}>Logs</h3>
    {logs.map((log, index) => (
      <div key={index} style={{ color: log.type === 'error' ? 'red' : 'inherit' }}>{log.message}</div>
    ))}
  </div>
);

export default function HomePage() {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const router = useRouter();

  const addLog = (message, type = 'info') => {
    setLogs(prevLogs => [...prevLogs, { message, type }]);
  };

  const handleGenerate = async () => {
    if (!topic) return;
    setLogs([]); // Clear logs on new generation
    addLog(`Starting course generation for topic: "${topic}"`);
    setLoading(true);
    try {
      const response = await fetch('/api/generate-course', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic }),
      });

      addLog(`Response from /api/generate-course: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to generate course: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      addLog(`Data from /api/generate-course: ${JSON.stringify(data, null, 2)}`);

      const { course } = data;
      router.push(`/course/${course.id}`);
    } catch (error) {
      addLog(error.message, 'error');
    } finally {
      setLoading(false);
      addLog('Finished course generation attempt.');
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
      <LogViewer logs={logs} />
    </div>
  );
}
