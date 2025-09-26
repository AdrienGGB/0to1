import React from 'react';
import Sidebar from './Sidebar';

const MainLayout = ({ children }) => (
  <div className="flex min-h-screen bg-gray-50">
    <Sidebar />
    <main className="flex-1 ml-64">
      {children}
    </main>
  </div>
);

export default MainLayout;
