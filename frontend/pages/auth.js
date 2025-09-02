import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/router';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [requestMagicLink, setRequestMagicLink] = useState(false); // New state for magic link
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();
  const supabase = createClient(); // Create client-side Supabase instance

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push('/');
      }
    };
    getSession();

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        router.push('/');
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router, supabase]);

  const handleAuth = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      let authResponse;
      if (requestMagicLink) {
        authResponse = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin + window.location.pathname } });
      } else if (isSignUp) {
        if (password !== confirmPassword) {
          setMessage('Passwords do not match');
          setLoading(false);
          return;
        }
        authResponse = await supabase.auth.signUp({ email, password });
      } else {
        authResponse = await supabase.auth.signInWithPassword({ email, password });
      }

      const { data, error } = authResponse;
      console.log('Auth Response Data:', data);
      console.log('Auth Response Error:', error);

      if (error) throw error;

      if (requestMagicLink) {
        setMessage('Magic link sent! Check your email.');
      } else if (isSignUp) {
        setMessage('Sign up successful! Please check your email for verification.');
      } else { // This is for sign-in with password
        setMessage('Authentication successful!');
      }
    } catch (error) {
      if (error.message.includes('User already registered') || error.message.includes('User already exists')) {
        setMessage('This email is already registered. Please sign in or use a different email.');
      } else {
        setMessage(`Error: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>
        {isSignUp ? 'Sign Up' : (requestMagicLink ? 'Request Magic Link' : 'Sign In')}
      </h2>
      <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
        />
        {!requestMagicLink && (
          <>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
            {isSignUp && (
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            )}
            <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <input type="checkbox" checked={showPassword} onChange={() => setShowPassword(!showPassword)} />
              Show Password
            </label>
          </>
        )}
        <button type="submit" disabled={loading} style={{ padding: '10px 15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          {loading ? 'Loading...' : (requestMagicLink ? 'Send Magic Link' : (isSignUp ? 'Sign Up' : 'Sign In'))}
        </button>
      </form>
      <p style={{ textAlign: 'center', marginTop: '15px' }}>
        <a href="#" onClick={() => {
          setIsSignUp(!isSignUp);
          setRequestMagicLink(false); // Reset magic link request when switching sign up/in
        }} style={{ color: '#007bff', textDecoration: 'none' }}>
          {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
        </a>
      </p>
      {!isSignUp && (
        <p style={{ textAlign: 'center', marginTop: '10px' }}>
          <a href="#" onClick={() => setRequestMagicLink(!requestMagicLink)} style={{ color: '#007bff', textDecoration: 'none' }}>
            {requestMagicLink ? 'Sign In with Password' : 'Sign In with Magic Link'}
          </a>
        </p>
      )}
      {message && <p style={{ textAlign: 'center', marginTop: '15px', color: message.startsWith('Error') ? 'red' : 'green' }}>{message}</p>}

      
    </div>
  );
};

export default Auth;