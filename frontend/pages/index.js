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
    <div className="min-h-screen bg-[linear-gradient(135deg,#0f2027_0%,#203a43_35%,#2c5364_65%,#6a11cb_100%)] flex flex-col items-center justify-center py-12 px-4 animated-gradient">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">0to1: AI Learning Assistant</h1>
          <p className="text-gray-300">Create structured courses in seconds</p>
        </div>
        
        <Card className="shadow-lg border-0 bg-white/10 text-white backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl font-semibold text-center text-white">Generate Your Course</CardTitle>
            <p className="text-sm text-gray-300 text-center">Enter your topic below to create a course</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="topic" className="text-sm font-medium text-white">Course Topic</Label>
              <Input
                id="topic"
                type="text"
                placeholder="Enter a topic to learn..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="h-10 bg-gray-800 text-white"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium text-white">Course Level</Label>
              <Tabs value={level} onValueChange={setLevel} className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-[linear-gradient(135deg,#2c5364_0%,#203a43_50%,#0f2027_100%)] text-white">
                  <TabsTrigger value="beginner" className="data-[state=active]:bg-gray-500 data-[state=active]:border-gray-400">Beginner</TabsTrigger>
                  <TabsTrigger value="intermediate" className="data-[state=active]:bg-gray-500 data-[state=active]:border-gray-400">Intermediate</TabsTrigger>
                  <TabsTrigger value="expert" className="data-[state=active]:bg-gray-500 data-[state=active]:border-gray-400">Expert</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            <Button 
              onClick={handleGenerate} 
              disabled={loading || !topic} 
              className="w-full h-10 bg-gray-200 text-gray-800 hover:bg-gray-300"
            >
              {loading ? 'Generating...' : 'Generate Course'}
            </Button>
          </CardContent>
        </Card>
        
        <div className="text-center">
          <RecentCourses />
        </div>
      </div>
    </div>
  );
}

export default HomePage;