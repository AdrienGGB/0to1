
import React from 'react';
import Link from 'next/link';
import { supabase } from '@/utils/supabase/client';
import { useRouter } from 'next/router';

const Sidebar = () => {
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/auth');
  };

  return (
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
      <ul style={{ listStyle: 'none', padding: 0, flexGrow: 1 }}>
        <li style={{ marginBottom: '15px' }}>
          <Link href="/" style={{ textDecoration: 'none', color: '#333', fontSize: '18px', display: 'block', padding: '10px 15px', borderRadius: '5px', transition: 'background-color 0.2s ease' }}>
            Home
          </Link>
        </li>
        {/* Add more links here in the future */}
      </ul>
      <button onClick={handleSignOut} style={{ padding: '10px 15px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
        Sign Out
      </button>
    </div>
  );
};

export default Sidebar;
