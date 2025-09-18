import React from 'react';
import Sidebar from './Sidebar';
import { DarkModeToggle } from './DarkModeToggle';

const MainLayout = ({ children }) => (
  <div className="flex">
    <Sidebar />
    <main className="flex-grow p-10 relative">
      <div className="absolute top-4 right-4">
        <DarkModeToggle />
      </div>
      {children}
    </main>
  </div>
);

export default MainLayout;
