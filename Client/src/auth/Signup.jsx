import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthForm from './components/AuthForm/AuthForm';
import { useAuth } from '../context/AuthContext';
import { useGoogleLogin } from '@react-oauth/google';

const Signup = () => {
  const navigate = useNavigate();
  const { session, signUpWithOTP, signInWithGoogle } = useAuth();
  const [googleError, setGoogleError] = useState('');

  const googleAuthSignup = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setGoogleError('');
      try {
        const result = await signInWithGoogle(null, tokenResponse.access_token);
        if (result.success) {
          navigate('/home');
        } else {
          setGoogleError(result.error || 'Failed to finish Google signup');
        }
      } catch (error) {
        setGoogleError(error.message || 'Error occurred during Google signup');
      }
    },
    onError: () => setGoogleError('Google signup failed'),
  });
  
  const fields = [
    { id: 'email', label: 'Email', type: 'email', placeholder: 'Enter email address' }
  ];

  useEffect(() => {
    if (session) {
      navigate('/home');
    }
  }, [session, navigate]);

  const handleSignup = async (data) => {
    setGoogleError(''); // Clear any previous Google errors
    // Use passwordless signup with OTP
    console.log('Attempting to sign up with OTP for:', data.email);
    const result = await signUpWithOTP(data.email);
    ``
    if (result.success) {
      console.log('OTP signup successful, navigating to verification');
      // Navigate to OTP verification
      navigate('/verify-email', { state: { email: data.email } });
      return;
    } else {
      console.error('OTP signup failed:', result.error);
      throw new Error(result.error || 'Failed to sign up');
    }
  };

  const handleGoogleAuth = () => {
    setGoogleError('');
    googleAuthSignup();
  };

  return (
    <AuthForm
      title="Sign up to continue"
      subtitle="Join CollabSpace and start collaborating today."
      fields={fields}
      submitText="Sign up"
      onSubmit={handleSignup}
      footerText="Already have a CollabSpace account?"
      footerLink="/login"
      footerLinkText="Log in"
      showSocialAuth={true}
      onSocialAuth={handleGoogleAuth}
      socialAuthError={googleError}
    />
  );
};

export default Signup;
