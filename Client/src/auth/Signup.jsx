import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthForm from './components/AuthForm/AuthForm';
import { useAuth } from '../context/AuthContext';

const Signup = () => {
  const navigate = useNavigate();
  const { session, signUpWithOTP, signInWithGoogle } = useAuth();
  const [googleError, setGoogleError] = useState('');
  
  const fields = [
    { id: 'email', label: 'Email', type: 'email', placeholder: 'Enter email address' }
  ];

  useEffect(() => {
    if (session) {
      navigate('/dashboard');
    }
  }, [session, navigate]);

  const handleSignup = async (data) => {
    setGoogleError(''); // Clear any previous Google errors
    // Use passwordless signup with OTP
    console.log('Attempting to sign up with OTP for:', data.email);
    const result = await signUpWithOTP(data.email);
    
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

  const handleGoogleAuth = async () => {
    setGoogleError('');
    const result = await signInWithGoogle();
    
    if (!result.success) {
      setGoogleError(result.error || 'Failed to sign in with Google');
    }
    // If successful, the OAuth redirect will happen automatically
  };

  return (
    <AuthForm
      title="Sign up to continue"
      subtitle={true}
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
