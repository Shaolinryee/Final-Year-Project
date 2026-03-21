import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthForm from './components/AuthForm/AuthForm';
import { useAuth } from '../context/AuthContext';
import { useGoogleLogin } from '@react-oauth/google';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, session, signInWithGoogle } = useAuth();
  const [googleError, setGoogleError] = useState('');
  const [successMessage, setSuccessMessage] = useState(location.state?.message || '');

  const googleAuthLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setGoogleError('');
      try {
        const result = await signInWithGoogle(null, tokenResponse.access_token);
        if (result.success) {
          navigate('/home');
        } else {
          setGoogleError(result.error || 'Failed to finish Google login');
        }
      } catch (error) {
        setGoogleError(error.message || 'Error occurred during Google login');
      }
    },
    onError: () => setGoogleError('Google Authentication failed'),
  });

  const fields = [
    { id: 'email', label: 'Email', type: 'email', placeholder: 'Enter email address' },
    { id: 'password', label: 'Password', type: 'password', placeholder: 'Enter password' }
  ];

  useEffect(() => {
    if (session) {
      navigate('/home');
    }
    // Clear success message after 5 seconds
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [session, navigate, successMessage]);

  const handleLogin = async (data) => {
    setGoogleError(''); // Clear any previous Google errors
    try {
      const result = await signIn(data.email, data.password);
      
      if (result.success) {
        // Session will be updated automatically, navigate to home
        navigate('/home');
        return;
      } else {
        // Provide user-friendly error messages
        let errorMessage = result.error || 'Failed to log in';
        if (errorMessage.includes('Invalid login credentials') || errorMessage.includes('Invalid email or password')) {
          errorMessage = 'Invalid email or password. Please check your credentials and try again.';
        } else if (errorMessage.includes('Email not confirmed')) {
          errorMessage = 'Please verify your email address before logging in.';
        }
        throw new Error(errorMessage);
      }
    } catch (error) {
      // Re-throw with the error message
      throw error;
    }
  };

  const handleGoogleAuth = () => {
    setGoogleError('');
    googleAuthLogin();
  };

  return (
    <>
      {successMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full px-4">
          <div className="p-4 rounded-xl text-sm font-medium bg-green-500/20 text-green-500 border border-green-500/30">
            {successMessage}
          </div>
        </div>
      )}
      <AuthForm
        title="Log in to continue"
        fields={fields}
        submitText="Log in"
        onSubmit={handleLogin}
        footerText="Can't log in?"
        footerLink="/signup"
        footerLinkText="Create an account"
        showSocialAuth={true}
        onSocialAuth={handleGoogleAuth}
        socialAuthError={googleError}
        forgotPasswordLink="/forgot-password"
      />
    </>
  );
};

export default Login;
