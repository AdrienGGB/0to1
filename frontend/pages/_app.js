import React, { useEffect, useState } from 'react';
import MainLayout from '../components/MainLayout';
import '../styles/globals.css';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { supabase } from '../utils/supabase/client';

function MyApp({ Component, pageProps }) {

  return (
    <SessionContextProvider
      supabaseClient={supabase}
      initialSession={pageProps.initialSession}
    >
      <MainLayout>
        <Component {...pageProps} />
      </MainLayout>
    </SessionContextProvider>
  );
}

export default MyApp;