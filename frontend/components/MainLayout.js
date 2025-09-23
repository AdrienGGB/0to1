import React from 'react';
import Sidebar from './Sidebar';

const MainLayout = ({ children }) => (
  <div className="flex min-h-screen bg-gray-50">
    <Sidebar />
    <main className="flex-1">
      {children}
    </main>
  </div>
);

export default MainLayout;
