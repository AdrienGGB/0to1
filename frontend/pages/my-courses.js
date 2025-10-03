import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

const MyCoursesPage = ({ user }) => {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    if (!user) {
      router.push('/auth');
      return;
    }

    const fetchEnrolledCourses = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.rpc('get_user_courses', { p_user_id: user.id });

        if (error) {
          throw new Error(error.message);
        }

        setEnrolledCourses(data);
      } catch (err) {
        console.error('Error fetching enrolled courses:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEnrolledCourses();
  }, [user, router, supabase]);

  if (loading) return <p className="text-base leading-relaxed">Loading your courses...</p>;
  if (error) return <p className="text-red-500 text-base leading-relaxed">Error: {error}</p>;
  if (!user) return null; // Should be redirected by useEffect

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,#cfe8ff_0%,#a9d4ff_40%,#b9c6ff_70%,#d6b9ff_100%)] flex flex-col items-center py-12 px-4 text-base leading-relaxed">
      <div className="w-full max-w-4xl px-4">
        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">My Courses</h2>

        {enrolledCourses.length === 0 ? (
          <div className="text-center p-8 bg-white/50 rounded-lg shadow-md">
            <p className="text-gray-600 mb-4">You haven’t enrolled in any courses yet. Browse the catalog to get started.</p>
            <Link href="/">
              <Button className="bg-gray-800 text-white hover:bg-gray-900 py-3 px-4 text-base">Browse Courses</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrolledCourses.map((enrollment) => (
              <Link key={enrollment.course_id} href={`/course/${enrollment.course_id}`} className="text-gray-800 no-underline flex">
                <Card className="relative flex-1 flex flex-col border border-gray-200 rounded-lg p-4 transition-shadow duration-300 ease-in-out hover:shadow-lg cursor-pointer bg-white min-h-[200px]">
                  <CardHeader className="flex-grow">
                    <CardTitle className="text-lg font-semibold text-gray-800">{enrollment.course_title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow flex flex-col justify-between p-6">
                    <p className="text-sm text-gray-600 line-clamp-3 mb-2">{enrollment.course_description}</p>
                    <p className="text-xs text-gray-500">Enrolled: {new Date(enrollment.enrolled_at).toLocaleDateString()}</p>
                    <div className="mt-4">
                      <Progress value={enrollment.progress} className="w-full" />
                      <p className="text-sm text-gray-600 mt-1 text-right">{enrollment.progress}% Complete</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCoursesPage;
