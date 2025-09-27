import React, { useState, useEffect } from 'react';
import MainLayout from '../components/MainLayout';
import '../styles/globals.css';
import { createClient } from '@/utils/supabase/client';

function MyApp({ Component, pageProps }) {
  const [user, setUser] = useState(null);
  const supabase = createClient();

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };
    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase]);

  return (
    <MainLayout user={user}>
      <Component {...pageProps} />
    </MainLayout>
  );
}

export default MyApp;
