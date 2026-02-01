                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../../layout/MainLayout';
import { FaCalendarAlt, FaUsers, FaVideo, FaCheckCircle, FaArrowRight } from 'react-icons/fa';

const RequestDemo = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    workEmail: '',
    companyName: '',
    teamSize: '',
    interests: 'General Collaboration'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    setSubmitted(true);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (submitted) {
    return (
      <MainLayout>
        <div className="bg-brand-dark min-h-screen flex items-center justify-center pt-20 transition-colors duration-300">
          <div className="max-w-2xl w-full bg-brand-light p-10 md:p-16 rounded-[48px] text-center border border-brand-border shadow-2xl mx-4 transition-all duration-300">
            <div className="w-24 h-24 bg-brand/10 rounded-[32px] flex items-center justify-center mx-auto mb-10 shadow-lg shadow-brand/5">
                 <FaCalendarAlt className="text-5xl text-brand" />
            </div>
            <h1 className="text-3xl md:text-6xl font-black text-text-primary mb-6 leading-tight">Discovery Call <span className="text-brand">Scheduled</span>!</h1>
            <p className="text-xl text-text-secondary font-medium mb-12 leading-relaxed px-4">
              We've received your request! A product expert will reach out to <span className="text-text-primary font-bold">{formData.workEmail}</span> within the next 24 hours to schedule your personalized walkthrough.
            </p>
            <Link to="/" className="inline-block bg-brand hover:opacity-90 text-white font-black py-5 px-12 rounded-[24px] transition-all shadow-2xl shadow-brand/20 active:scale-95 text-xl">
              Return Home
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="bg-brand-dark min-h-screen pt-20 transition-colors duration-300">
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-20 items-center">
            {/* Left Column: Content */}
            <div className="flex-1">
                <span className="text-brand font-bold uppercase tracking-widest text-sm mb-4 inline-block">See it in action</span>
                <h1 className="text-4xl md:text-6xl font-extrabold text-text-primary mb-8 leading-tight">Expert-led demo of <span className="text-brand">CollabSpace.</span></h1>
                <p className="text-xl text-text-secondary mb-12 leading-relaxed font-medium">
                    Personalized walkthroughs for teams of all sizes. See how CollabSpace can streamline your specific workflows and bring your team together.
                </p>

                <div className="space-y-10">
                    <div className="flex gap-6 group">
                        <div className="w-14 h-14 bg-brand/10 rounded-2xl flex items-center justify-center shrink-0 border border-brand/20 group-hover:scale-110 transition-transform shadow-lg shadow-brand/5">
                            <FaVideo className="text-brand text-2xl" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-text-primary mb-2 group-hover:text-brand transition-colors">30-Minute Live Demo</h3>
                            <p className="text-text-secondary font-medium leading-relaxed">Our product experts will show you exactly how to solve your team's unique challenges.</p>
                        </div>
                    </div>
                    <div className="flex gap-6 group">
                        <div className="w-14 h-14 bg-green-500/10 rounded-2xl flex items-center justify-center shrink-0 border border-green-500/20 group-hover:scale-110 transition-transform shadow-lg shadow-green-500/5">
                            <FaUsers className="text-green-500 text-2xl" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-text-primary mb-2 group-hover:text-green-500 transition-colors">Team Onboarding</h3>
                            <p className="text-text-secondary font-medium leading-relaxed">Learn how to onboard your entire team seamlessly and maximize adoption from day one.</p>
                        </div>
                    </div>
                    <div className="flex gap-6 group">
                        <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center shrink-0 border border-purple-500/20 group-hover:scale-110 transition-transform shadow-lg shadow-purple-500/5">
                            <FaCheckCircle className="text-purple-500 text-2xl" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-text-primary mb-2 group-hover:text-purple-500 transition-colors">Feature Deep Dives</h3>
                            <p className="text-text-secondary font-medium leading-relaxed">Explore task management, role-based permissions, and collaboration features in depth.</p>
                        </div>
                    </div>
                </div>

                <div className="mt-20 pt-12 border-t border-brand-border">
                    <p className="text-text-secondary opacity-60 text-sm mb-6 font-bold uppercase tracking-widest">Trusted by world-class teams</p>
                    <div className="flex items-center gap-12 opacity-30 grayscale hover:grayscale-0 transition-all duration-500">
                        {/* Mock logo placeholders with theme-aware boxes */}
                        <div className="h-8 w-28 bg-text-primary/20 rounded-lg"></div>
                        <div className="h-8 w-36 bg-text-primary/20 rounded-lg"></div>
                        <div className="h-8 w-24 bg-text-primary/20 rounded-lg"></div>
                    </div>
                </div>
            </div>

            {/* Right Column: Form */}
            <div className="w-full lg:w-[550px]">
                <div className="bg-brand-light p-10 md:p-14 rounded-[48px] border border-brand-border shadow-2xl relative overflow-hidden transition-all duration-300">
                    <div className="absolute top-0 left-0 w-full h-2 bg-brand shadow-[0_0_20px_rgba(37,99,235,0.3)]"></div>
                    <h2 className="text-3xl font-black text-text-primary mb-10 text-center leading-tight">Schedule your discovery call</h2>
                    
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <label className="text-xs font-black text-text-secondary uppercase tracking-widest pl-1">First Name</label>
                                <input required type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="w-full bg-brand-dark border border-brand-border rounded-2xl p-4 text-text-primary focus:border-brand focus:ring-4 focus:ring-brand/10 outline-none transition-all font-medium" />
                            </div>
                            <div className="space-y-3">
                                <label className="text-xs font-black text-text-secondary uppercase tracking-widest pl-1">Last Name</label>
                                <input required type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="w-full bg-brand-dark border border-brand-border rounded-2xl p-4 text-text-primary focus:border-brand focus:ring-4 focus:ring-brand/10 outline-none transition-all font-medium" />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-xs font-black text-text-secondary uppercase tracking-widest pl-1">Work Email</label>
                            <input required type="email" name="workEmail" value={formData.workEmail} onChange={handleChange} className="w-full bg-brand-dark border border-brand-border rounded-2xl p-4 text-text-primary focus:border-brand focus:ring-4 focus:ring-brand/10 outline-none transition-all font-medium" />
                        </div>

                        <div className="space-y-3">
                            <label className="text-xs font-black text-text-secondary uppercase tracking-widest pl-1">Company Name</label>
                            <input required type="text" name="companyName" value={formData.companyName} onChange={handleChange} className="w-full bg-brand-dark border border-brand-border rounded-2xl p-4 text-text-primary focus:border-brand focus:ring-4 focus:ring-brand/10 outline-none transition-all font-medium" />
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <label className="text-xs font-black text-text-secondary uppercase tracking-widest pl-1">Team Size</label>
                                <select required name="teamSize" value={formData.teamSize} onChange={handleChange} className="w-full bg-brand-dark border border-brand-border rounded-2xl p-4 text-text-primary focus:border-brand focus:ring-4 focus:ring-brand/10 outline-none transition-all cursor-pointer font-bold appearance-none">
                                    <option value="" className="bg-brand-light">Select...</option>
                                    <option className="bg-brand-light">1-10</option>
                                    <option className="bg-brand-light">11-50</option>
                                    <option className="bg-brand-light">51-200</option>
                                    <option className="bg-brand-light">201-500</option>
                                    <option className="bg-brand-light">500+</option>
                                </select>
                            </div>
                            <div className="space-y-3">
                                <label className="text-xs font-black text-text-secondary uppercase tracking-widest pl-1">Main Interest</label>
                                <select name="interests" value={formData.interests} onChange={handleChange} className="w-full bg-brand-dark border border-brand-border rounded-2xl p-4 text-text-primary focus:border-brand focus:ring-4 focus:ring-brand/10 outline-none transition-all cursor-pointer font-bold appearance-none">
                                    <option className="bg-brand-light">General Collaboration</option>
                                    <option className="bg-brand-light">Task Management</option>
                                    <option className="bg-brand-light">Enterprise Security</option>
                                    <option className="bg-brand-light">Detailed Analytics</option>
                                </select>
                            </div>
                        </div>

                        <button disabled={isSubmitting} className={`w-full py-6 rounded-[24px] text-white font-black text-xl transition-all flex items-center justify-center gap-4 ${isSubmitting ? 'bg-brand/50 cursor-not-allowed' : 'bg-brand hover:opacity-90 shadow-2xl shadow-brand/30 active:scale-95'}`}>
                            {isSubmitting ? 'Sending Request...' : 'Get My Demo'}
                            {!isSubmitting && <FaArrowRight className="text-sm" />}
                        </button>

                        <p className="text-[11px] text-center text-text-secondary font-medium leading-relaxed pt-2 px-6">
                            By requesting a demo, you agree to our <Link to="#" className="text-brand font-bold underline decoration-brand/20 hover:decoration-brand">Privacy Policy</Link> and to receive marketing communications from CollabSpace.
                        </p>
                    </form>
                </div>
            </div>
          </div>
        </section>

        <section className="py-32 bg-brand/5 flex flex-col items-center justify-center text-center px-4 transition-colors duration-300">
            <h2 className="text-3xl md:text-5xl font-black text-text-primary mb-6">Want to dive in right away?</h2>
            <p className="text-lg text-text-secondary font-medium mb-12 max-w-2xl leading-relaxed">
                Alternatively, you can start a <span className="text-brand font-bold">14-day free trial</span> and explore all features on your own. No credit card required.
            </p>
            <Link to="/signup" className="group bg-brand text-white px-10 py-5 rounded-[24px] font-black text-xl shadow-2xl shadow-brand/20 hover:opacity-90 active:scale-95 transition-all flex items-center gap-4">
                Create Free Account <FaArrowRight className="text-sm group-hover:translate-x-2 transition-transform" />
            </Link>
        </section>
      </div>
    </MainLayout>
  );
};

export default RequestDemo;
