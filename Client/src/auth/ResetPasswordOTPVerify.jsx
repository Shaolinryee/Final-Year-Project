import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import OTPInput from './components/AuthForm/OTPInput';
import { useAuth } from '../context/AuthContext';

const ResetPasswordOTPVerify = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { verifyResetPasswordOTP, resetPassword } = useAuth();
  const email = location.state?.email || "user@example.com";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resending, setResending] = useState(false);
  const [rateLimited, setRateLimited] = useState(false);

  const handleVerify = async (otp) => {
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    setLoading(true);
    setError('');
    
    const result = await verifyResetPasswordOTP(email, otp);
    
    if (result.success) {
      // After OTP verification, navigate to reset password page
      navigate("/reset-password", { state: { email } });
    } else {
      setError(result.error || 'Invalid verification code');
    }
    
    setLoading(false);
  };

  const handleResend = async () => {
    setResending(true);
    setError('');
    setRateLimited(false);
    
    const result = await resetPassword(email);
    
    if (result.success) {
      setError('Reset code resent! Please check your email.');
      setRateLimited(false);
    } else {
      // Check if it's a rate limit error
      if (result.code === 'over_email_send_rate_limit') {
        setRateLimited(true);
        setError('Too many email requests. Please wait 5-10 minutes before trying again. This is a security measure to prevent spam.');
      } else {
        setError(result.error || 'Failed to resend code');
        setRateLimited(false);
      }
    }
    
    setResending(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-dark py-12 px-4 transition-colors duration-300">
      <div className="max-w-[450px] w-full bg-brand-light p-10 rounded-3xl shadow-2xl border border-brand-border flex flex-col items-center transition-all duration-300">
         {/* Logo */}
         <div className="flex items-center gap-3 mb-10 transition-transform hover:scale-105 duration-300">
            <div className="w-10 h-10 bg-brand rounded-xl transform rotate-45 flex items-center justify-center shadow-lg shadow-brand/20">
                <div className="w-5 h-5 bg-white rounded-full"></div>
            </div>
          <span className="text-text-primary text-3xl font-black tracking-tight uppercase">CollabSpace</span>
        </div>

        <h1 className="text-text-primary text-xl font-bold mb-3">Verify your email</h1>
        <p className="text-sm text-text-secondary text-center mb-2 font-medium">
          Enter the code we've sent to:
        </p>
        <p className="text-base font-bold text-text-primary mb-4 px-4 py-2 bg-brand-dark/50 rounded-xl border border-brand-border">{email}</p>
        
        <div className="w-full mb-4 p-3 rounded-xl text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20">
          <p className="font-medium mb-1">📧 Check your email</p>
          <p className="text-[10px] leading-relaxed">
            We've sent a password reset code to your email. Please check your inbox and spam folder.
          </p>
        </div>

        {error && (
          <div className={`w-full mb-4 p-3 rounded-xl text-sm font-medium ${
            error.includes('resent') 
              ? 'bg-green-500/20 text-green-500 border border-green-500/30' 
              : error.includes('rate limit') || error.includes('Too many')
              ? 'bg-orange-500/20 text-orange-500 border border-orange-500/30'
              : 'bg-red-500/20 text-red-500 border border-red-500/30'
          }`}>
            {error}
            {(error.includes('rate limit') || error.includes('Too many')) && (
              <p className="text-xs mt-2 opacity-80">
                💡 Tip: Check your email inbox - you may have already received a code from a previous attempt.
              </p>
            )}
          </div>
        )}

        <OTPInput onComplete={handleVerify} />

        {loading && (
          <div className="w-full mt-10 py-4 rounded-xl font-bold text-white bg-brand/20 text-white/30 cursor-not-allowed border border-brand/10 text-center">
            Verifying...
          </div>
        )}

        <button
          onClick={handleResend}
          disabled={resending || rateLimited}
          className="mt-8 text-sm text-brand hover:underline cursor-pointer font-bold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {resending ? 'Resending...' : rateLimited ? 'Rate limit - Please wait' : "Didn't receive a code? Resend code"}
        </button>

        <div className="mt-10 pt-8 border-t border-brand-border w-full flex flex-col items-center gap-4">
             <div className="flex items-center gap-2 opacity-40 hover:opacity-70 transition-opacity duration-300">
                <div className="w-5 h-5 bg-text-primary rounded-sm transform rotate-45"></div>
                <span className="text-text-primary text-xs font-bold uppercase tracking-widest">CollabSpace</span>
             </div>
             <p className="text-[11px] text-text-secondary text-center max-w-[320px] font-medium leading-relaxed">
                One account for Jira, Confluence, Trello and <a href="#" className="text-brand hover:underline font-bold">more</a>.
                This site is protected by reCAPTCHA and the Google <a href="#" className="text-brand hover:underline font-bold">Privacy Policy</a> and <a href="#" className="text-brand hover:underline font-bold">Terms of Service</a> apply.
             </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordOTPVerify;
