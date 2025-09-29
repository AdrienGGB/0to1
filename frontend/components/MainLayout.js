import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';

const MainLayout = ({ children, user }) => {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(true); // Start collapsed by default

  const toggleSidebar = () => {
    setSidebarCollapsed(!isSidebarCollapsed);
  };

  if (!user) {
    return <main className="flex-1">{children}</main>;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar isCollapsed={isSidebarCollapsed} onToggle={toggleSidebar} />
      <main className={`flex-1 transition-all duration-300`}>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-50 md:hidden"
        >
          <Menu className="h-6 w-6" />
        </Button>
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
