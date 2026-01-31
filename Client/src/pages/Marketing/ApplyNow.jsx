import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import MainLayout from '../../layout/MainLayout';
import { FaCloudUploadAlt, FaArrowLeft } from 'react-icons/fa';

const ApplyNow = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const jobTitle = location.state?.jobTitle || "Open Position";
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    linkedin: '',
    portfolio: '',
    message: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <MainLayout>
        <div className="bg-brand-dark min-h-screen flex items-center justify-center pt-20 transition-colors duration-300">
          <div className="max-w-xl w-full bg-brand-light p-12 md:p-16 rounded-[48px] text-center border border-brand-border shadow-2xl mx-4 transition-all duration-300">
            <div className="w-24 h-24 bg-green-500/10 rounded-[32px] flex items-center justify-center mx-auto mb-10 shadow-lg shadow-green-500/5">
                 <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-green-500/20">✓</div>
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-text-primary mb-6 leading-tight">Application <span className="text-brand">Sent</span>!</h1>
            <p className="text-xl text-text-secondary font-medium mb-12 leading-relaxed px-4">
              Thank you for applying for the <span className="text-text-primary font-bold">{jobTitle}</span> position. Our team will review your application and get back to you soon.
            </p>
            <Link to="/careers" className="inline-block bg-brand hover:opacity-90 text-white font-black py-5 px-12 rounded-[24px] transition-all shadow-2xl shadow-brand/20 active:scale-95 text-xl">
              Back to Careers
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="bg-brand-dark min-h-screen pt-20 transition-colors duration-300">
        <div className="max-w-4xl mx-auto px-4 py-20">
          <Link to="/careers" className="group flex items-center gap-3 text-brand font-bold mb-10 transition-all hover:-translate-x-1">
            <div className="w-8 h-8 bg-brand/10 rounded-full flex items-center justify-center group-hover:bg-brand group-hover:text-white transition-colors">
              <FaArrowLeft size={12} />
            </div>
            <span>Back to Careers</span>
          </Link>
          
          <div className="mb-12">
            <h1 className="text-4xl md:text-6xl font-black text-text-primary mb-4 leading-tight">Apply for <span className="text-brand">{jobTitle}</span></h1>
            <p className="text-xl text-text-secondary font-medium">Please fill out the form below to submit your application and join our mission.</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-brand-light p-8 md:p-14 rounded-[40px] border border-brand-border shadow-2xl transition-all duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="space-y-3">
                <label className="text-xs font-black text-text-secondary uppercase tracking-widest pl-1">First Name *</label>
                <input required type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="w-full bg-brand-dark border border-brand-border rounded-2xl p-4 text-text-primary focus:border-brand focus:ring-4 focus:ring-brand/10 outline-none transition-all font-medium" placeholder="John" />
              </div>
              <div className="space-y-3">
                <label className="text-xs font-black text-text-secondary uppercase tracking-widest pl-1">Last Name *</label>
                <input required type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="w-full bg-brand-dark border border-brand-border rounded-2xl p-4 text-text-primary focus:border-brand focus:ring-4 focus:ring-brand/10 outline-none transition-all font-medium" placeholder="Doe" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="space-y-3">
                <label className="text-xs font-black text-text-secondary uppercase tracking-widest pl-1">Email Address *</label>
                <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-brand-dark border border-brand-border rounded-2xl p-4 text-text-primary focus:border-brand focus:ring-4 focus:ring-brand/10 outline-none transition-all font-medium" placeholder="john@example.com" />
              </div>
              <div className="space-y-3">
                <label className="text-xs font-black text-text-secondary uppercase tracking-widest pl-1">Phone Number *</label>
                <input required type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full bg-brand-dark border border-brand-border rounded-2xl p-4 text-text-primary focus:border-brand focus:ring-4 focus:ring-brand/10 outline-none transition-all font-medium" placeholder="+1 (555) 000-0000" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="space-y-3">
                <label className="text-xs font-black text-text-secondary uppercase tracking-widest pl-1">LinkedIn Profile</label>
                <input type="url" name="linkedin" value={formData.linkedin} onChange={handleChange} className="w-full bg-brand-dark border border-brand-border rounded-2xl p-4 text-text-primary focus:border-brand focus:ring-4 focus:ring-brand/10 outline-none transition-all font-medium" placeholder="https://linkedin.com/in/username" />
              </div>
              <div className="space-y-3">
                <label className="text-xs font-black text-text-secondary uppercase tracking-widest pl-1">Portfolio URL</label>
                <input type="url" name="portfolio" value={formData.portfolio} onChange={handleChange} className="w-full bg-brand-dark border border-brand-border rounded-2xl p-4 text-text-primary focus:border-brand focus:ring-4 focus:ring-brand/10 outline-none transition-all font-medium" placeholder="https://portfolio.com" />
              </div>
            </div>

            <div className="mb-10 p-10 border-2 border-dashed border-brand-border rounded-3xl flex flex-col items-center justify-center text-center hover:border-brand/50 transition-all cursor-pointer bg-brand-dark/50 group">
                <FaCloudUploadAlt className="text-5xl text-brand mb-4 group-hover:scale-110 transition-transform" />
                <p className="text-text-primary font-bold text-lg mb-1">Upload Resume/CV *</p>
                <p className="text-text-secondary opacity-60 text-xs font-medium">PDF, DOCX, or RTF (Max 5MB)</p>
            </div>

            <div className="space-y-3 mb-10">
              <label className="text-xs font-black text-text-secondary uppercase tracking-widest pl-1">Additional Message</label>
              <textarea name="message" value={formData.message} onChange={handleChange} rows="5" className="w-full bg-brand-dark border border-brand-border rounded-2xl p-4 text-text-primary focus:border-brand focus:ring-4 focus:ring-brand/10 outline-none transition-all font-medium" placeholder="Share anything else you'd like us to know..."></textarea>
            </div>

            <button disabled={isSubmitting} className={`w-full py-6 rounded-[24px] text-white font-black text-xl transition-all shadow-2xl active:scale-95 ${isSubmitting ? 'bg-brand/50 cursor-not-allowed' : 'bg-brand hover:opacity-90 shadow-brand/30'}`}>
              {isSubmitting ? 'Submitting Application...' : 'Submit Application'}
            </button>

            <p className="text-center text-text-secondary font-medium text-[11px] mt-8 leading-relaxed px-6">
              By submitting this form, you agree to our <Link to="#" className="text-brand font-bold underline decoration-brand/20 hover:decoration-brand">Privacy Policy</Link> and <Link to="#" className="text-brand font-bold underline decoration-brand/20 hover:decoration-brand">Terms of Service</Link>.
            </p>
          </form>
        </div>
      </div>
    </MainLayout>
  );
};

export default ApplyNow;
