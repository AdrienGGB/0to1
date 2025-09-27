import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import RecentCourses from '../components/RecentCourses';
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from '@/components/ui/carousel';
import { Badge } from '@/components/ui/badge';

function HomePage() {
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

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const mockCourses = [
    { title: "The Renaissance Period", description: "Explore the art, science, and culture of the Renaissance.", level: "beginner" },
    { title: "Introduction to Quantum Computing", description: "Understand the basics of quantum mechanics and its application in computing.", level: "intermediate" },
    { title: "The Art of Storytelling", description: "Learn techniques to craft compelling narratives.", level: "expert" },
    { title: "Mastering Modern JavaScript", description: "Dive deep into ES6+ features and advanced JavaScript concepts.", level: "intermediate" },
    { title: "Sustainable Living: A Beginner's Guide", description: "Discover practical ways to reduce your environmental footprint.", level: "beginner" },
  ];

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,#cfe8ff_0%,#a9d4ff_40%,#b9c6ff_70%,#d6b9ff_100%)] flex flex-col items-center py-12 px-4">
      <div className="w-full max-w-4xl">
        <header className="flex justify-between items-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800">0to1</h1>
          <div>
            {user ? (
              <Button onClick={handleSignOut} variant="outline">Sign Out</Button>
            ) : (
              <Link href="/auth">
                <Button className="bg-gray-800 text-white hover:bg-gray-900">Sign In</Button>
              </Link>
            )}
          </div>
        </header>

        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">AI Learning Assistant</h2>
          <p className="text-lg text-gray-600">Create structured courses in seconds</p>
        </div>

        <Card className="shadow-lg border-0 bg-white text-gray-800 mb-12">
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
                placeholder="e.g., The History of the Internet"
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
              className="w-full h-10 bg-gray-800 text-white hover:bg-gray-900"
            >
              {loading ? 'Generating...' : 'Generate Course'}
            </Button>
          </CardContent>
        </Card>

        {user ? (
          <RecentCourses />
        ) : (
          <div className="w-full max-w-4xl mx-auto mt-12">
            <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">Discover a new way to learn</h3>
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-4">
                {mockCourses.map((course, index) => (
                  <CarouselItem key={index} className="pl-4 sm:basis-1/2 lg:basis-1/3">
                    <div className="p-1">
                      <div className="relative flex-1 flex flex-col border border-gray-200 rounded-lg p-4 transition-shadow duration-300 ease-in-out hover:shadow-lg cursor-pointer bg-white min-h-[200px]">
                        <Badge className="absolute top-1 right-1 bg-gray-800 text-white text-xs font-bold py-0 px-1">{course.level ? course.level.charAt(0).toUpperCase() + course.level.slice(1) : 'N/A'}</Badge>
                        <h3 className="text-lg font-bold mb-2 overflow-hidden text-ellipsis whitespace-nowrap pr-12">{course.title}</h3>
                        <p className="text-xs text-gray-600 overflow-hidden text-ellipsis h-16">{course.description}</p>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </div>
        )}
      </div>
    </div>
  );
}

export default HomePage;
