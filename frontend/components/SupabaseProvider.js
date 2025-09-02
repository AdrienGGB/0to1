import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { supabase } from '../utils/supabase/client';

const SupabaseProvider = ({ children, pageProps }) => {
  return (
    <SessionContextProvider
      supabaseClient={supabase}
      initialSession={pageProps.initialSession}
    >
      {children}
    </SessionContextProvider>
  );
};

export default SupabaseProvider;
