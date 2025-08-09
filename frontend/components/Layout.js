import React from 'react';
import Sidebar from './Sidebar';

const Layout = ({ children }) => (
  <div style={{ display: 'flex' }}>
    <Sidebar />
    <main style={{ flex: 1 }}>{children}</main>
  </div>
);

export default Layout;


import React from 'react';
import Sidebar from './Sidebar';

const Layout = ({ children }) => (
  <div style={{ display: 'flex' }}>
    <Sidebar />
    <main style={{ flexGrow: 1, padding: '40px' }}>
      {children}
    </main>
  </div>
);

export default Layout;
