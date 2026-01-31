import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthForm from './components/AuthForm/AuthForm';
import { useAuth } from '../context/AuthContext';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { resetPassword } = useAuth();
  
  const fields = [
    { id: 'email', label: 'Email', type: 'email', placeholder: 'Enter your email address' }
  ];

  const handleForgotPassword = async (data) => {
    const result = await resetPassword(data.email);
    
    if (result.success) {
      // Navigate to OTP verification page
      navigate('/reset-password-otp', { state: { email: data.email } });
      return;
    } else {
      throw new Error(result.error || 'Failed to send reset password code');
    }
  };

  return (
    <AuthForm
      title="Forgot Password?"
      subtitle="No worries! Enter your email address and we'll send you a code to reset your password."
      fields={fields}
      submitText="Send Reset Code"
      onSubmit={handleForgotPassword}
      footerText="Remember your password?"
      footerLink="/login"
      footerLinkText="Back to login"
      showSocialAuth={false}
    />
  );
};

export default ForgotPassword;
