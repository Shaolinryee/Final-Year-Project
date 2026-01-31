import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthInput from './AuthInput';
import SocialAuthButton from './SocialAuthButton';
import { validateEmail, validatePassword } from './authForm.validation';
import logo from '../../../assets/logo.jpg'; // Assuming logo path or using a placeholder

const AuthForm = ({
  title,
  subtitle,
  fields,
  submitText,
  onSubmit,
  footerText,
  footerLink,
  footerLinkText,
  showSocialAuth = true,
  onSocialAuth,
  socialAuthError,
  forgotPasswordLink
}) => {
  const [formData, setFormData] = useState(
    fields.reduce((acc, field) => ({ ...acc, [field.id]: '' }), {})
  );
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const validateField = (id, value) => {
    if (id === 'email') return validateEmail(value);
    if (id === 'password') return validatePassword(value);
    return value ? null : `${id.charAt(0).toUpperCase() + id.slice(1)} is required`;
  };

  const handleChange = (id, value) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
    const error = validateField(id, value);
    setErrors((prev) => ({ ...prev, [id]: error }));
    // Clear submit error when user starts typing
    if (submitError) {
      setSubmitError('');
    }
  };

  const isFormInvalid = fields.some((field) => !!validateField(field.id, formData[field.id]));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isFormInvalid) return;

    setLoading(true);
    setSubmitError(''); // Clear previous errors
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error("Form submission error:", error);
      setSubmitError(error.message || 'An error occurred. Please try again.');
    } finally {
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

        {title && <h1 className="text-text-primary text-xl font-bold mb-3">{title}</h1>}
        {subtitle && (
          <p className="text-sm text-text-secondary text-center mb-8 font-medium">
            {subtitle}
          </p>
        )}

        <form onSubmit={handleSubmit} className="w-full">
          {submitError && (
            <div className="w-full mb-4 p-3 rounded-xl text-sm font-medium bg-red-500/20 text-red-500 border border-red-500/30">
              {submitError}
            </div>
          )}
          
          <div className="space-y-2">
            {fields.map((field) => (
              <AuthInput
                key={field.id}
                {...field}
                value={formData[field.id]}
                onChange={(e) => handleChange(field.id, e.target.value)}
                error={errors[field.id]}
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading || isFormInvalid}
            className={`w-full mt-8 py-4 rounded-xl font-bold text-white transition-all shadow-lg active:scale-95
              ${loading || isFormInvalid ? 'bg-brand/20 text-white/30 cursor-not-allowed border border-brand/10' : 'bg-brand hover:opacity-90 shadow-brand/20'}
            `}
          >
            {loading ? 'Processing...' : submitText}
          </button>

          {forgotPasswordLink && (
            <div className="text-center mt-4">
              <Link to={forgotPasswordLink} className="text-sm text-brand hover:underline font-bold">
                Forgot Password?
              </Link>
            </div>
          )}
        </form>

        {showSocialAuth && (
          <div className="w-full mt-8">
            <div className="relative mb-8">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-brand-border"></div>
                </div>
                <div className="relative flex justify-center text-[10px]">
                    <span className="px-3 bg-brand-light text-text-primary/50 font-bold uppercase tracking-widest">Or continue with</span>
                </div>
            </div>
            
            {socialAuthError && (
              <div className="mb-4 p-3 rounded-xl text-sm font-medium bg-red-500/20 text-red-500 border border-red-500/30">
                {socialAuthError}
              </div>
            )}
            
            <SocialAuthButton provider="google" onClick={onSocialAuth || (() => {})} />
          </div>
        )}

        <div className="mt-8 pt-8 border-t border-brand-border w-full text-center">
          <p className="text-sm text-text-secondary font-medium">
            {footerText}{' '}
            <Link to={footerLink} className="text-brand hover:underline font-bold">
              {footerLinkText}
            </Link>
          </p>
        </div>

        <div className="mt-10 flex flex-col items-center gap-4">
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

export default AuthForm;
