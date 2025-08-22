import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import CourseHeader from '../../components/CourseHeader';
import LessonList from '../../components/LessonList';
import LessonContentRenderer from '../../components/LessonContentRenderer'; // Import the new component

const CoursePage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [course, setCourse] = useState(null);
  const [progress, setProgress] = useState({
    completedLessonIds: [],
    lastLessonId: null,
    lessonTimes: {},
    timeSpentSeconds: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);

  // New states for selected lesson content
  const [selectedLessonId, setSelectedLessonId] = useState(null);
  const [selectedLessonContent, setSelectedLessonContent] = useState(null);
  const [loadingLessonContent, setLoadingLessonContent] = useState(false);
  const [lessonContentError, setLessonContentError] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUserId = localStorage.getItem('userId');
      if (storedUserId) {
        setUserId(storedUserId);
      }
    }
  }, []);

  const fetchProgress = useCallback(async (userId, courseId) => {
    try {
      const response = await fetch(`/api/progress?userId=${userId}&courseId=${courseId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.progress) {
          setProgress(data.progress);
        }
      }
    } catch (err) {
      console.error('Failed to fetch progress', err);
    }
  }, []);

  const handleSaveProgress = useCallback(async (newProgress) => {
    if (!userId || !id) return;

    const updatedProgress = { ...progress, ...newProgress };

    // Recompute timeSpentSeconds based on merged lessonTimes
    const mergedTimeSpentSeconds = Object.values(updatedProgress.lessonTimes || {}).reduce((a, b) => a + b, 0);
    updatedProgress.timeSpentSeconds = mergedTimeSpentSeconds;

    setProgress(updatedProgress);

    try {
      await fetch('/api/progress/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          courseId: id,
          progress: updatedProgress,
          clientUpdatedAt: new Date().toISOString(),
        }),
      });
    } catch (err) {
      console.error('Failed to save progress', err);
    }
  }, [userId, id, progress]);

  const handleLessonTimeUpdate = useCallback((lessonId, timeSpent) => {
    setProgress(prevProgress => {
      const newLessonTimes = {
        ...prevProgress.lessonTimes,
        [lessonId]: Math.max(prevProgress.lessonTimes[lessonId] || 0, timeSpent),
      };
      const newTimeSpentSeconds = Object.values(newLessonTimes).reduce((a, b) => a + b, 0);
      const updatedProgress = {
        ...prevProgress,
        lessonTimes: newLessonTimes,
        timeSpentSeconds: newTimeSpentSeconds,
      };
      handleSaveProgress(updatedProgress); // Save immediately on time update
      return updatedProgress;
    });
  }, [handleSaveProgress]);

  const [enhancing, setEnhancing] = useState(null);

  const handleEnhanceLesson = async (lessonId) => {
    setEnhancing(lessonId);
    setError(null);
    try {
      const res = await fetch('/api/enhance-lesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonId, courseId: id }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to enhance lesson');
      }

      const enhancedLesson = await res.json();

      setCourse((prevCourse) => {
        const newLessons = prevCourse.lessons.map((lesson) => {
          if (lesson.id === lessonId) {
            return { ...lesson, ...enhancedLesson };
          }
          return lesson;
        });
        return { ...prevCourse, lessons: newLessons };
      });

      if (selectedLessonId === lessonId) {
        setLessonContent(enhancedLesson.content);
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setEnhancing(null);
    }
  };

  useEffect(() => {
    if (!id || !userId) return;

    const fetchCourseData = async () => {
      try {
        const courseResponse = await fetch(`/api/courses/${id}`);
        if (!courseResponse.ok) {
          throw new Error('Failed to fetch course');
        }
        const courseData = await courseResponse.json();
        setCourse(courseData);
      } catch (err) {
        setError(err.message);
      }
    };

    const fetchAllData = async () => {
      setLoading(true);
      await fetchCourseData();
      await fetchProgress(userId, id);
      setLoading(false);
    };

    fetchAllData();

  }, [id, userId, fetchProgress]);

  // Effect to fetch detailed lesson content when selectedLessonId changes
  useEffect(() => {
    const fetchDetailedLessonContent = async () => {
      if (!selectedLessonId || !id) {
        setSelectedLessonContent(null);
        return;
      }

      const lesson = course.lessons.find(l => l.id === selectedLessonId);

      if (lesson && !lesson.content) {
        setSelectedLessonContent('Please enhance this lesson to see its content.');
        return;
      }

      setLoadingLessonContent(true);
      setLessonContentError(null);
      try {
        // Assuming an API endpoint like /api/lessons/[lessonId]?courseId=[courseId]
        // that returns the full lesson object including its 'content' field
        const response = await fetch(`/api/lessons/${selectedLessonId}?courseId=${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch detailed lesson content');
        }
        const data = await response.json();
        setSelectedLessonContent(data.content);
      } catch (err) {
        console.error('Error fetching detailed lesson content:', err);
        setLessonContentError(err.message);
        setSelectedLessonContent(null);
      } finally {
        setLoadingLessonContent(false);
      }
    };

    fetchDetailedLessonContent();
  }, [selectedLessonId, id, course]);


  if (loading) return <p>Loading course...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!course) return <p>Course not found.</p>;

  return (
    <div>
      <CourseHeader title={course.title} description={course.description} />
      {selectedLessonContent ? (
        <div>
          <button onClick={() => setSelectedLessonId(null)} style={{ marginBottom: '20px', padding: '10px 20px', cursor: 'pointer' }}>
            Back to Lesson List
          </button>
          {loadingLessonContent ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <p>Loading lesson content...</p>
              {/* You can add a simple spinner here if you have one */}
              <div style={{ border: '4px solid #f3f3f3', borderRadius: '50%', borderTop: '4px solid #3498db', width: '20px', height: '20px', animation: 'spin 1s linear infinite', margin: 'auto' }}></div>
              <style jsx>{`
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              `}</style>
            </div>
          ) : lessonContentError ? (
            <div style={{ color: 'red', padding: '20px', border: '1px solid red', borderRadius: '5px' }}>
              <p>Failed to load lesson content. Please try again.</p>
              <p>Details: {lessonContentError}</p>
            </div>
          ) : (
            <LessonContentRenderer rawContent={selectedLessonContent} />
          )}
        </div>
      ) : (
        <LessonList
          lessons={course.lessons}
          progress={progress}
          onSaveProgress={handleSaveProgress}
          onLessonTimeUpdate={handleLessonTimeUpdate}
          onLessonSelect={setSelectedLessonId} // Pass the setter for selectedLessonId
          selectedLessonId={selectedLessonId} // Pass the currently selected ID
          onEnhanceLesson={handleEnhanceLesson} // Pass the new handler
          enhancing={enhancing}
        />
      )}
    </div>
  );
};

export default CoursePage;
