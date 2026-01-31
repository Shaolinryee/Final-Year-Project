import React from 'react';
import MainLayout from '../../layout/MainLayout';
import JoinBeta from './components/JoinBeta';

const Contact = () => {
  return (
    <MainLayout>
      <div className="bg-brand-dark min-h-screen pt-20 transition-colors duration-300">
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-6xl font-extrabold text-text-primary mb-6">Get in <span className="text-brand">Touch</span></h1>
              <p className="text-lg text-text-primary opacity-70 font-medium">Have questions? We're here to help you get the most out of CollabSpace.</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="bg-brand-light p-8 md:p-12 rounded-2xl shadow-xl border border-brand-border">
                <form className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-text-primary mb-2">Name</label>
                    <input type="text" className="w-full bg-brand-dark border border-brand-border rounded-lg p-3 text-text-primary placeholder:text-text-primary/30 outline-none focus:border-brand transition-all font-medium" placeholder="Enter your name" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-text-primary mb-2">Email</label>
                    <input type="email" className="w-full bg-brand-dark border border-brand-border rounded-lg p-3 text-text-primary placeholder:text-text-primary/30 outline-none focus:border-brand transition-all font-medium" placeholder="Enter your email" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-text-primary mb-2">Message</label>
                    <textarea rows="4" className="w-full bg-brand-dark border border-brand-border rounded-lg p-3 text-text-primary placeholder:text-text-primary/30 outline-none focus:border-brand transition-all font-medium" placeholder="How can we help?"></textarea>
                  </div>
                  <button className="w-full bg-brand hover:opacity-90 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-brand/20 transform active:scale-95">
                    Send Message
                  </button>
                </form>
              </div>
              
              <div className="flex flex-col justify-center space-y-10">
                <div className="flex gap-6 items-start">
                  <div className="w-12 h-12 bg-brand/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-brand text-xl font-bold">@</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-text-primary mb-2">General Inquiries</h3>
                    <p className="text-text-primary opacity-70 font-medium">support@collabspace.com</p>
                  </div>
                </div>
                <div className="flex gap-6 items-start">
                  <div className="w-12 h-12 bg-brand/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-brand text-xl font-bold">S</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-text-primary mb-2">Sales</h3>
                    <p className="text-text-primary opacity-70 font-medium">sales@collabspace.com</p>
                  </div>
                </div>
                <div className="flex gap-6 items-start">
                  <div className="w-12 h-12 bg-brand/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-brand text-xl font-bold">L</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-text-primary mb-2">Location</h3>
                    <p className="text-text-primary opacity-70 font-medium">123 Workspace Ave, San Francisco, CA</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <JoinBeta />
      </div>
    </MainLayout>
  );
};

export default Contact;
