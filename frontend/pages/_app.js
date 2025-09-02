import React from 'react';
import MainLayout from '../components/MainLayout';
import '../styles/globals.css';
import dynamic from 'next/dynamic';

const SupabaseProvider = dynamic(() => import('../components/SupabaseProvider'), { ssr: false });

function MyApp({ Component, pageProps }) {

  return (
    <SupabaseProvider pageProps={pageProps}>
      <MainLayout>
        <Component {...pageProps} />
      </MainLayout>
    </SupabaseProvider>
  );
}

export default MyApp;