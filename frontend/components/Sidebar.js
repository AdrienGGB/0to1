
import React from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/router';
import { Button } from '@/components/ui/button';

const Sidebar = () => {
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/auth');
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen">
      <div className="p-6 border-b border-gray-200">
        <Link href="/" className="text-2xl font-bold text-gray-900 hover:text-gray-700 transition-colors">
          0to1
        </Link>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          <li>
            <Link 
              href="/" 
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 hover:text-gray-900 transition-colors"
            >
              Home
            </Link>
          </li>
        </ul>
      </nav>
      
      <div className="p-4 border-t border-gray-200">
        <Button 
          onClick={handleSignOut} 
          variant="destructive" 
          className="w-full"
        >
          Sign Out
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
