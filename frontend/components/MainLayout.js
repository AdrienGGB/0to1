import React, { useState } from 'react';
import Sidebar from './Sidebar';

const MainLayout = ({ children, user }) => {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!isSidebarCollapsed);
  };

  if (!user) {
    return <main className="flex-1">{children}</main>;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar isCollapsed={isSidebarCollapsed} onToggle={toggleSidebar} />
      <main className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        {children}
      </main>
    </div>
  );
};

export default MainLayout;