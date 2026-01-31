import React, { useState } from 'react';
import MainLayout from '../../layout/MainLayout';
import { FaTicketAlt, FaInfoCircle } from 'react-icons/fa';

const SupportTicket = () => {
  const [formData, setFormData] = useState({ subject: '', category: 'General', priority: 'Medium', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <MainLayout>
        <div className="bg-brand-dark min-h-screen flex items-center justify-center pt-20 transition-colors duration-300">
          <div className="max-w-xl w-full bg-brand-light p-12 md:p-16 rounded-[48px] text-center border border-brand-border shadow-2xl mx-4 transition-all duration-300">
            <div className="w-24 h-24 bg-brand/10 rounded-[32px] flex items-center justify-center mx-auto mb-10 shadow-lg shadow-brand/5">
                 <FaTicketAlt className="text-5xl text-brand" />
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-text-primary mb-6 leading-tight">Ticket <span className="text-brand">Opened</span>!</h1>
            <p className="text-xl text-text-secondary font-medium mb-12 leading-relaxed px-4">
              Your support ticket has been received. Our team will review it and reply via email within 24 hours.
            </p>
            <button onClick={() => setSubmitted(false)} className="inline-block bg-brand/10 hover:bg-brand/20 text-brand font-black py-4 px-10 rounded-2xl transition-all active:scale-95 shadow-sm">
              Open Another Ticket
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="bg-brand-dark min-h-screen pt-20 transition-colors duration-300">
        <section className="py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <header className="mb-16 text-center">
              <h1 className="text-4xl md:text-6xl font-black text-text-primary mb-6 leading-tight">Open a Support <span className="text-brand">Ticket</span></h1>
              <p className="text-xl text-text-secondary font-medium max-w-2xl mx-auto leading-relaxed">Can't find what you're looking for? Submit a ticket and our expert team will help you out.</p>
            </header>

            <form onSubmit={handleSubmit} className="bg-brand-light p-8 md:p-14 rounded-[40px] border border-brand-border shadow-2xl space-y-10 transition-all duration-300">
              <div className="space-y-3">
                <label className="text-xs font-black text-text-secondary uppercase tracking-widest pl-1">Subject *</label>
                <input required type="text" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} className="w-full bg-brand-dark border border-brand-border rounded-2xl p-4 text-text-primary focus:border-brand focus:ring-4 focus:ring-brand/10 outline-none transition-all font-medium" placeholder="Briefly describe the issue" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                    <label className="text-xs font-black text-text-secondary uppercase tracking-widest pl-1">Category</label>
                    <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-brand-dark border border-brand-border rounded-2xl p-4 text-text-primary focus:border-brand focus:ring-4 focus:ring-brand/10 outline-none transition-all cursor-pointer font-bold appearance-none">
                        <option className="bg-brand-light">General</option>
                        <option className="bg-brand-light">Technical Issue</option>
                        <option className="bg-brand-light">Billing</option>
                        <option className="bg-brand-light">Feature Request</option>
                    </select>
                </div>
                <div className="space-y-3">
                    <label className="text-xs font-black text-text-secondary uppercase tracking-widest pl-1">Priority</label>
                    <select value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})} className="w-full bg-brand-dark border border-brand-border rounded-2xl p-4 text-text-primary focus:border-brand focus:ring-4 focus:ring-brand/10 outline-none transition-all cursor-pointer font-bold appearance-none">
                        <option className="bg-brand-light">Low</option>
                        <option className="bg-brand-light">Medium</option>
                        <option className="bg-brand-light">High</option>
                        <option className="bg-brand-light">Urgent</option>
                    </select>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-black text-text-secondary uppercase tracking-widest pl-1">Details *</label>
                <textarea required value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} rows="6" className="w-full bg-brand-dark border border-brand-border rounded-2xl p-4 text-text-primary focus:border-brand focus:ring-4 focus:ring-brand/10 outline-none transition-all font-medium leading-relaxed" placeholder="Provide as much detail as possible..."></textarea>
              </div>

              <div className="p-6 bg-brand/5 rounded-3xl border border-brand/20 flex gap-4 items-center">
                    <div className="w-10 h-10 bg-brand/10 rounded-xl flex items-center justify-center text-brand shrink-0">
                        <FaInfoCircle />
                    </div>
                    <p className="text-sm text-text-secondary font-medium leading-relaxed">
                        <span className="text-text-primary font-bold">Pro-tip:</span> 80% of support issues are resolved instantly in our <a href="/help" className="text-brand font-bold underline decoration-brand/20 hover:decoration-brand">FAQs</a>.
                    </p>
              </div>

              <button disabled={isSubmitting} className={`w-full py-6 rounded-[24px] text-white font-black text-xl transition-all shadow-2xl active:scale-95 ${isSubmitting ? 'bg-brand/50 cursor-not-allowed' : 'bg-brand hover:opacity-90 shadow-brand/30'}`}>
                {isSubmitting ? 'Opening Ticket...' : 'Submit Ticket'}
              </button>
            </form>
          </div>
        </section>
      </div>
    </MainLayout>
  );
};

export default SupportTicket;
