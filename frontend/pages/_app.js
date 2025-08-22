
import React, { useEffect } from 'react';
import MainLayout from '../components/MainLayout';
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      let userId = localStorage.getItem('userId');
      if (!userId) {
        userId = crypto.randomUUID();
        localStorage.setItem('userId', userId);
      }
    }
  }, []);

  return (
    <MainLayout>
      <Component {...pageProps} />
    </MainLayout>
  );
}

export default MyApp;
