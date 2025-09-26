import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import TopicInput from '../components/TopicInput';
import GenerateButton from '../components/GenerateButton';
import RecentCourses from '../components/RecentCourses';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

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
    <div className="min-h-screen bg-[linear-gradient(135deg,#2a3a4a_0%,#3f6075_35%,#5b7fa1_65%,#8b5fd6_100%)] flex flex-col items-center py-12 px-4 animated-gradient">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">0to1: AI Learning Assistant</h1>
          <p className="text-gray-300">Create structured courses in seconds</p>
        </div>
        
        <Card className="shadow-lg border-0 bg-white text-gray-800">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl font-semibold text-center">Generate Your Course</CardTitle>
            <p className="text-sm text-gray-600 text-center">Enter your topic below to create a course</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="topic" className="text-sm font-medium">Course Topic</Label>
              <Input
                id="topic"
                type="text"
                placeholder="Enter a topic to learn..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="h-10 bg-gray-100 text-gray-800"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium">Course Level</Label>
              <Tabs value={level} onValueChange={setLevel} className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-gray-200 text-gray-800">
                  <TabsTrigger value="beginner" className="data-[state=active]:bg-gray-500 data-[state=active]:text-white">Beginner</TabsTrigger>
                  <TabsTrigger value="intermediate" className="data-[state=active]:bg-gray-500 data-[state=active]:text-white">Intermediate</TabsTrigger>
                  <TabsTrigger value="expert" className="data-[state=active]:bg-gray-500 data-[state=active]:text-white">Expert</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            <Button 
              onClick={handleGenerate} 
              disabled={loading || !topic} 
              className="w-full h-10 bg-gray-800 text-white hover:bg-gray-700"
            >
              {loading ? 'Generating...' : 'Generate Course'}
            </Button>
          </CardContent>
        </Card>
      </div>
      <div className="w-full mt-12">
        <RecentCourses />
      </div>
    </div>
  );
}

export default HomePage;