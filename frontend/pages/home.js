import React from 'react';
import Link from 'next/link';
import RecentCourses from '../components/RecentCourses';

function HomePage() {
  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,#cfe8ff_0%,#a9d4ff_40%,#b9c6ff_70%,#d6b9ff_100%)] flex flex-col items-center py-12 px-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Welcome to 0to1</h1>
          <p className="text-lg text-gray-600">Your AI Learning Assistant</p>
          <div className="mt-4">
            <Link href="/" className="text-gray-600 hover:text-gray-800">
              Create a new course
            </Link>
          </div>
        </div>
        <RecentCourses />
      </div>
    </div>
  );
}

export default HomePage;