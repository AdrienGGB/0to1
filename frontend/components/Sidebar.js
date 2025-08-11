
import React from 'react';
import Link from 'next/link';

const Sidebar = () => (
  <div
    style={{
      width: '280px',
      backgroundColor: '#fff',
      padding: '30px',
      height: '100vh',
      borderRight: '1px solid #eee',
      display: 'flex',
      flexDirection: 'column',
    }}
  >
    <div style={{ marginBottom: '40px' }}>
      <Link href="/" style={{ textDecoration: 'none', color: '#000', fontSize: '28px', fontWeight: 'bold' }}>
        0to1
      </Link>
    </div>
    <ul style={{ listStyle: 'none', padding: 0 }}>
      <li style={{ marginBottom: '15px' }}>
        <Link href="/" style={{ textDecoration: 'none', color: '#333', fontSize: '18px', display: 'block', padding: '10px 15px', borderRadius: '5px', transition: 'background-color 0.2s ease' }}>
          Home
        </Link>
      </li>
      {/* Add more links here in the future */}
    </ul>
  </div>
);

export default Sidebar;
