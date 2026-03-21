import React, { createContext, useEffect, useContext, useState } from 'react';
import api from '../services/axiosInstance';

const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sign Up with OTP
  const signUpWithOTP = async (email) => {
    try {
      const response = await api.post('/auth/signup-otp', { email });
      return { success: true, message: response.data.message };
    } catch (error) {
      console.error('Error signing up with OTP:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to send verification code' 
      };
    }
  };

  // Sign Up with password
  const signUp = async (email, password, name) => {
    try {
      const response = await api.post('/auth/register', { email, password, name });
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      
      return { success: true, data: user };
    } catch (error) {
      console.error('Error signing up:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to register' 
      };
    }
  };

  // Sign In
  const signIn = async (email, password) => {
    try {
      if (!email || !password) {
        return { success: false, error: 'Email and password are required' };
      }
      
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      
      return { success: true, data: user };
    } catch (error) {
      console.error('Error signing in:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Invalid email or password' 
      };
    }
  };

  // Sign Out
  const signOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    return { success: true };
  };

  // Verify OTP
  const verifyOTP = async (email, token) => {
    try {
      const response = await api.post('/auth/verify-otp', { email, token });
      const { token: authToken, user } = response.data;
      
      localStorage.setItem('token', authToken);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);

      return { success: true, data: user };
    } catch (error) {
      console.error('Error verifying OTP:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Invalid verification code' 
      };
    }
  };

  // Reset Password - Send OTP
  const resetPassword = async (email) => {
    try {
      const response = await api.post('/auth/reset-password', { email });
      return { success: true, message: response.data.message };
    } catch (error) {
      console.error('Error sending reset password OTP:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to send reset code' 
      };
    }
  };

  // Verify Reset Password OTP
  const verifyResetPasswordOTP = async (email, token) => {
    try {
      const response = await api.post('/auth/verify-reset-otp', { email, token });
      // We don't set user session here usually, wait for final password update
      // But the backend returns a token if we want to allow immediate login
      return { success: true, data: response.data.user };
    } catch (error) {
      console.error('Error verifying reset password OTP:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Invalid reset code' 
      };
    }
  };

  // Update Password (for reset password flow)
  const updatePasswordForReset = async (email, password) => {
    try {
      const response = await api.post('/auth/update-password-reset', { email, password });
      return { success: true, message: response.data.message };
    } catch (error) {
      console.error('Error updating password:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update password' 
      };
    }
  };

  // Resend OTP
  const resendOTP = async (email) => {
    return await signUpWithOTP(email);
  };

  // Google Auth
  const signInWithGoogle = async (credential, accessToken) => {
    try {
      const response = await api.post('/auth/google', { credential, accessToken });
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      
      return { success: true, data: user };
    } catch (error) {
      console.error('Google Auth Error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Google authentication failed' 
      };
    }
  };

  useEffect(() => {
    // Check local storage for existing session
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const value = {
    session: user ? { user } : null, // for compatibility with existing code
    user,
    loading,
    signUp,
    signUpWithOTP,
    signIn,
    signOut,
    logout: signOut,
    verifyOTP,
    resendOTP,
    resetPassword,
    verifyResetPasswordOTP,
    updatePasswordForReset,
    signInWithGoogle,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within a AuthContextProvider');
  }
  return context;
};
