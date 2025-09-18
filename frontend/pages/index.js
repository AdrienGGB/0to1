import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import RecentCourses from '../components/RecentCourses';
import { createClient } from '@/utils/supabase/client';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"

function HomePage() {
  const [topic, setTopic] = useState('');
  const [level, setLevel] = useState('beginner');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [sessionLoaded, setSessionLoaded] = useState(false);
  const supabase = createClient();

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

      if (course && course.lessons) {
        course.lessons.forEach(async (lesson) => {
          try {
            await fetch('/api/enhance-lesson', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ lessonId: lesson.id, courseId: course.id }),
            });
          } catch (enhanceError) {
            console.error(`Failed to enhance lesson ${lesson.id}:`, enhanceError);
          }
        });
      }

      router.push(`/course/${course.id}`);
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!sessionLoaded || !user) {
    return <p>Redirecting to authentication...</p>;
  }

  return (
    <div className="container mx-auto max-w-lg py-12 px-6">
      <section className="py-12 px-6 bg-brand-gradient text-white rounded-xl text-center mb-16">
        <h1 className="text-4xl font-bold">Instant AI Courses</h1>
        <p className="mt-2 text-lg">Create structured beginner courses in seconds.</p>
      </section>

      <Card className="p-6 mb-16"> {/* Added Card component */}
        <div className="grid gap-4"> {/* Changed to grid for better spacing with labels */}
          <div>
            <Label htmlFor="topic">Course Topic</Label> {/* Added Label */}
            <Input
              id="topic" // Added id for label association
              type="text"
              placeholder="Enter a topic..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="p-4 text-lg h-14"
            />
          </div>
          <div>
            <Label>Course Level</Label> {/* Added Label */}
            <Tabs value={level} onValueChange={setLevel} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="beginner">Beginner</TabsTrigger>
                <TabsTrigger value="intermediate">Intermediate</TabsTrigger>
                <TabsTrigger value="expert">Expert</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <Button onClick={handleGenerate} disabled={loading} className="bg-brand-indigoPurple hover:bg-brand-blue text-white font-bold py-4 text-lg">
            {loading ? 'Generating...' : 'Generate Course'}
          </Button>
        </div>
      </Card>

      <RecentCourses />
    </div>
  );
}

export default HomePage;
