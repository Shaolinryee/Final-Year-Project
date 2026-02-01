import React, { createContext, useEffect, useContext, useState } from 'react';
import { supabase } from '../lib/supabaseClient';       // Supabase client

const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [session, setSession] = useState(undefined);
  const [loading, setLoading] = useState(true);

  //Sign Up with OTP (passwordless)
  const signUpWithOTP = async (email) => {
    try {
      // Use signInWithOtp with shouldCreateUser for passwordless signup
      // Note: Remove emailRedirectTo to get OTP codes instead of magic links
      // Make sure Supabase email template is configured to send OTP codes
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true, // This allows signup via OTP
          // Removed emailRedirectTo - this makes it send OTP codes instead of magic links
        },
      });

      if (error) {
        console.error('Error signing up with OTP:', error);
        
        // Provide more helpful error messages
        let errorMessage = error.message;
        if (error.code === 'over_email_send_rate_limit' || error.message?.includes('email rate limit') || error.message?.includes('rate limit')) {
          errorMessage = 'Too many email requests. Please wait 5-10 minutes before trying again. This is a security measure to prevent spam.';
        } else if (error.message?.includes('email') && error.message?.includes('not configured')) {
          errorMessage = 'Email service is not configured. Please check your Supabase email settings.';
        } else if (error.message?.includes('invalid')) {
          errorMessage = 'Please enter a valid email address.';
        }
        
        return { success: false, error: errorMessage, code: error.code };
      }
      
      // Check if email was actually sent
      if (data) {
        console.log('OTP signup initiated:', data);
      }
      
      return { success: true, message: 'Verification code sent to your email' };
    } catch (error) {
      console.error('Error signing up with OTP:', error);
      return { success: false, error: error.message || 'Failed to send verification code. Please check your email settings.' };
    }
  };

  //Sign Up with password (traditional)
  const signUp = async (email, password) => {
    try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

  if (error) {
    console.error('Error signing up:', error);
    return { success: false, error: error.message };
      }
      
    return { success: true, data: data.user };
    } catch (error) {
      console.error('Error signing up:', error);
      return { success: false, error: error.message };
    }
  };

  //Sign In
  const signIn = async (email, password) => {
    try {
      if (!email || !password) {
        return { success: false, error: 'Email and password are required' };
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('Error signing in:', error);
        // Provide more user-friendly error messages
        let errorMessage = error.message;
        if (error.message?.includes('Invalid login credentials') || error.message?.includes('invalid')) {
          errorMessage = 'Invalid email or password. Please check your credentials and try again.';
        } else if (error.message?.includes('Email not confirmed') || error.message?.includes('not confirmed')) {
          errorMessage = 'Please verify your email address before logging in.';
        }
        return { success: false, error: errorMessage };
      }
      
      if (!data.user) {
        return { success: false, error: 'Invalid email or password' };
      }
      
      return { success: true, data: data.user };
    } catch (error) {
      console.error('Error signing in:', error);
      return { success: false, error: error.message || 'An error occurred during login' };
    }
  };

  //Sign Out
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (error) {
      console.error('Error signing out:', error);
      return { success: false, error: error.message };
    }
  };

  //Verify OTP
  const verifyOTP = async (email, token) => {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'email',
      });

      if (error) {
        console.error('Error verifying OTP:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: data.user };
    } catch (error) {
      console.error('Error verifying OTP:', error);
      return { success: false, error: error.message };
    }
  };

  //Reset Password - Send OTP
  const resetPassword = async (email) => {
    try {
      // Use resetPasswordForEmail to use the Reset Password template
      // Configure the template to use {{ .Token }} for OTP codes
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password-otp`,
      });

      if (error) {
        console.error('Error sending reset password OTP:', error);
        
        let errorMessage = error.message;
        if (error.code === 'over_email_send_rate_limit' || error.message?.includes('email rate limit') || error.message?.includes('rate limit')) {
          errorMessage = 'Too many email requests. Please wait 5-10 minutes before trying again.';
        } else if (error.message?.includes('email') && error.message?.includes('not configured')) {
          errorMessage = 'Email service is not configured. Please check your Supabase email settings.';
        } else if (error.message?.includes('User not found') || error.message?.includes('not found')) {
          errorMessage = 'No account found with this email address.';
        }
        
        return { success: false, error: errorMessage, code: error.code };
      }
      
      return { success: true, message: 'Password reset code sent to your email' };
    } catch (error) {
      console.error('Error sending reset password OTP:', error);
      return { success: false, error: error.message || 'Failed to send reset password code.' };
    }
  };

  //Verify Reset Password OTP
  const verifyResetPasswordOTP = async (email, token) => {
    try {
      // Use recovery type for password reset OTP verification
      // This is used with resetPasswordForEmail
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'recovery', // Recovery type for password reset
      });

      if (error) {
        console.error('Error verifying reset password OTP:', error);
        return { success: false, error: error.message };
      }

      // Session is automatically created when OTP is verified
      return { success: true, data: data.user };
    } catch (error) {
      console.error('Error verifying reset password OTP:', error);
      return { success: false, error: error.message };
    }
  };

  //Update Password (for reset password flow)
  const updatePasswordForReset = async (password) => {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        console.error('Error updating password:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: data.user };
    } catch (error) {
      console.error('Error updating password:', error);
      return { success: false, error: error.message };
    }
  };

  //Resend OTP
  const resendOTP = async (email) => {
    try {
      // Use signInWithOtp to resend the OTP
      // Note: Remove emailRedirectTo to get OTP codes instead of magic links
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
          // Removed emailRedirectTo - this makes it send OTP codes instead of magic links
        },
      });

      if (error) {
        console.error('Error resending OTP:', error);
        
        // Provide more helpful error messages
        let errorMessage = error.message;
        if (error.code === 'over_email_send_rate_limit' || error.message?.includes('email rate limit') || error.message?.includes('rate limit')) {
          errorMessage = 'Too many email requests. Please wait 5-10 minutes before trying again. This is a security measure to prevent spam.';
        } else if (error.message?.includes('email') && error.message?.includes('not configured')) {
          errorMessage = 'Email service is not configured. Please check your Supabase email settings.';
        }
        
        return { success: false, error: errorMessage, code: error.code };
      }

      return { success: true, message: 'Verification code resent to your email' };
    } catch (error) {
      console.error('Error resending OTP:', error);
      return { success: false, error: error.message || 'Failed to resend verification code.' };
    }
  };

  //Update User Metadata
  const updateUserMetadata = async (metadata) => {
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: metadata,
      });

      if (error) {
        console.error('Error updating user metadata:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: data.user };
    } catch (error) {
      console.error('Error updating user metadata:', error);
      return { success: false, error: error.message };
    }
  };

  //Update Password
  const updatePassword = async (password) => {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        console.error('Error updating password:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: data.user };
    } catch (error) {
      console.error('Error updating password:', error);
      return { success: false, error: error.message };
    }
  };

  //Social Auth (Google)
  const signInWithGoogle = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) {
        console.error('Error signing in with Google:', error);
        // Check for specific error messages
        let errorMessage = error.message;
        if (error.message?.includes('provider is not enabled') || error.message?.includes('Unsupported provider')) {
          errorMessage = 'Google authentication is not enabled. Please contact support or use email/password login.';
        }
        return { success: false, error: errorMessage };
      }

      // OAuth redirects immediately, so we don't return success here
      // The redirect will happen automatically
      return { success: true, data };
    } catch (error) {
      console.error('Error signing in with Google:', error);
      let errorMessage = error.message || 'Failed to initiate Google sign in';
      if (error.message?.includes('provider is not enabled') || error.message?.includes('Unsupported provider')) {
        errorMessage = 'Google authentication is not enabled. Please contact support or use email/password login.';
      }
      return { success: false, error: errorMessage };
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const value = {
    session,
    loading,
    signUp,
    signUpWithOTP,
    signIn,
    signOut,
    logout: signOut, // Alias for compatibility
    verifyOTP,
    resendOTP,
    resetPassword,
    verifyResetPasswordOTP,
    updatePasswordForReset,
    updateUserMetadata,
    updatePassword,
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
