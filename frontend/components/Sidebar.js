import React from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/router';
import { Button } from '@/components/ui/button';
import { Home, LogOut, ChevronsLeft, ChevronsRight } from 'lucide-react';

const Sidebar = ({ isCollapsed, onToggle }) => {
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/auth');
  };

  return (
    <>
      {/* Backdrop for mobile overlay */}
      {!isCollapsed && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        ></div>
      )}
      <div className={`fixed top-0 h-screen bg-white border-r border-gray-200 flex flex-col transition-all duration-300 z-50
        ${isCollapsed ? '-left-full lg:w-20' : 'left-0 w-64'}
        lg:left-0
      `}>
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-gray-900 hover:text-gray-700 transition-colors">
            {!isCollapsed && '0to1'}
          </Link>
          <Button variant="ghost" size="icon" onClick={onToggle} className="hidden lg:flex">
            {isCollapsed ? <ChevronsRight /> : <ChevronsLeft />}
          </Button>
        </div>
        
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            <li>
              <Link href="/" className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 hover:text-gray-900 transition-colors">
                <Home className="mr-3" />
                {!isCollapsed && 'Home'}
              </Link>
            </li>
          </ul>
        </nav>
        
        <div className="p-4 border-t border-gray-200">
          <Button onClick={handleSignOut} className="w-full sm:w-auto px-6 py-3 rounded-lg text-white font-semibold bg-gradient-to-r from-blue-500 to-purple-500 text-base">
            <LogOut className="mr-3" />
            {!isCollapsed && 'Sign Out'}
          </Button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
