
import React from 'react';
import Link from 'next/link';

const Sidebar = () => (
  <div style={{
    width: '240px',
    backgroundColor: '#f7f7f7',
    padding: '20px',
    height: '100vh',
    borderRight: '1px solid #eee'
  }}>
    <h2 style={{ fontSize: '24px', marginBottom: '30px' }}>0to1</h2>
    <ul style={{ listStyle: 'none', padding: 0 }}>
      <li style={{ marginBottom: '10px' }}>
        <Link href="/" style={{ textDecoration: 'none', color: '#333', fontSize: '16px' }}>
          Home
        </Link>
      </li>
      {/* Add more links here in the future */}
    </ul>
  </div>
);

export default Sidebar;
