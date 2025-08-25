import React from 'react';
import Sidebar from './Sidebar';

const MainLayout = ({ children }) => (
  <div style={{ display: 'flex' }}>
    <Sidebar />
    <main style={{ flexGrow: 1, padding: '40px' }}>
      {children}
    </main>
  </div>
);

export default MainLayout;
