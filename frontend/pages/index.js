import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

function LandingPage() {
  const [topic, setTopic] = useState('');
  const [level, setLevel] = useState('beginner');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [user, setUser] = useState(null);
  const supabase = createClient();

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };
    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase]);

  const handleGenerate = async () => {
    if (!user) {
      router.push('/auth');
      return;
    }
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

      router.push(`/course/${course.id}`);
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,#cfe8ff_0%,#a9d4ff_40%,#b9c6ff_70%,#d6b9ff_100%)] flex flex-col items-center py-12 px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">0to1: AI Learning Assistant</h1>
          <p className="text-gray-600">Create structured courses in seconds</p>
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
                  <TabsTrigger value="beginner" className="data-[state=active]:bg-gray-800 data-[state=active]:text-white">Beginner</TabsTrigger>
                  <TabsTrigger value="intermediate" className="data-[state=active]:bg-gray-800 data-[state=active]:text-white">Intermediate</TabsTrigger>
                  <TabsTrigger value="expert" className="data-[state=active]:bg-gray-800 data-[state=active]:text-white">Expert</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            <Button 
              onClick={handleGenerate} 
              disabled={loading || !topic} 
              className="w-full h-10 bg-gray-500 text-white hover:bg-gray-600"
            >
              {loading ? 'Generating...' : 'Generate Course'}
            </Button>
          </CardContent>
        </Card>
        <div className="text-center">
          <Link href="/home" className="text-gray-600 hover:text-gray-800">
            View Recent Courses
          </Link>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
