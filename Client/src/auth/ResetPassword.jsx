import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AuthInput from './components/AuthForm/AuthInput';
import { validatePassword } from './components/AuthForm/authForm.validation';
import { FaCheckCircle, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { session, updatePasswordForReset } = useAuth();
  const email = location.state?.email || session?.user?.email || "user@example.com";
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If user is not authenticated (no session from OTP verification), redirect to forgot password
    if (!session) {
      navigate('/forgot-password');
    }
  }, [session, navigate]);

  const handleChange = (id, value) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
    
    if (id === 'password') {
      const error = validatePassword(value);
      setErrors((prev) => ({ ...prev, password: error }));
      
      // Also check if confirm password matches
      if (formData.confirmPassword && value !== formData.confirmPassword) {
        setErrors((prev) => ({ ...prev, confirmPassword: 'Passwords do not match' }));
      } else if (formData.confirmPassword && value === formData.confirmPassword) {
        setErrors((prev) => ({ ...prev, confirmPassword: null }));
      }
    }
    
    if (id === 'confirmPassword') {
      if (value !== formData.password) {
        setErrors((prev) => ({ ...prev, confirmPassword: 'Passwords do not match' }));
      } else {
        setErrors((prev) => ({ ...prev, confirmPassword: null }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      setErrors(prev => ({ ...prev, password: passwordError }));
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match' }));
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      // Update password
      const passwordResult = await updatePasswordForReset(formData.password);

      if (!passwordResult.success) {
        setErrors({ general: passwordResult.error || 'Failed to reset password' });
        setLoading(false);
        return;
      }

      // Success - navigate to login page
      navigate("/login", { state: { message: 'Password reset successfully! Please login with your new password.' } });
    } catch (error) {
      console.error('Error resetting password:', error);
      setErrors({ general: error.message || 'An error occurred while resetting password' });
      setLoading(false);
    }
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

        <div className="flex items-center gap-2 mb-2">
          <h1 className="text-text-primary text-xl font-bold">Create New Password</h1>
          <FaCheckCircle className="text-green-500 text-xl" />
        </div>
        <p className="text-sm text-text-secondary mb-8 font-medium">Enter your new password below</p>

        <form onSubmit={handleSubmit} className="w-full">
          {errors.general && (
            <div className="w-full mb-4 p-3 rounded-xl text-sm font-medium bg-red-500/20 text-red-500 border border-red-500/30">
              {errors.general}
            </div>
          )}

          <div className="flex flex-col gap-1 w-full mb-6 p-4 bg-brand-dark/50 rounded-xl border border-brand-border">
            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Email address</label>
            <p className="text-base font-bold text-text-primary">{email}</p>
          </div>

          <div className="relative w-full">
            <AuthInput
              label="New Password"
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter new password"
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              error={errors.password}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-[42px] text-text-secondary hover:text-brand transition-colors p-1"
            >
              {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
            </button>
          </div>
          <p className="text-[11px] text-text-secondary mt-2 font-medium">Password must have at least 8 characters</p>

          <div className="relative w-full mt-4">
            <AuthInput
              label="Confirm Password"
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm new password"
              value={formData.confirmPassword}
              onChange={(e) => handleChange('confirmPassword', e.target.value)}
              error={errors.confirmPassword}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-[42px] text-text-secondary hover:text-brand transition-colors p-1"
            >
              {showConfirmPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading || !!errors.password || !!errors.confirmPassword || !formData.password || !formData.confirmPassword}
            className={`w-full mt-8 py-4 rounded-xl font-bold text-white transition-all shadow-lg active:scale-95
              ${loading || !!errors.password || !!errors.confirmPassword || !formData.password || !formData.confirmPassword ? 'bg-brand/20 text-white/30 cursor-not-allowed border border-brand/10' : 'bg-brand hover:opacity-90 shadow-brand/20'}
            `}
          >
            {loading ? 'Resetting Password...' : 'Reset Password'}
          </button>
        </form>

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

export default ResetPassword;
