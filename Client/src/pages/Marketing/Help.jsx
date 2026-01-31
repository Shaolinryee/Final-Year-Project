import React from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../../layout/MainLayout';
import FAQs from './components/FAQs';

const Help = () => {
  return (
    <MainLayout>
      <div className="bg-brand-dark min-h-screen pt-20 transition-colors duration-300">
        <section className="py-24 px-4 sm:px-6 lg:px-8 bg-brand-light/50 border-b border-brand-border">
          <div className="max-w-5xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold text-text-primary mb-10">How can we <span className="text-brand">help</span>?</h1>
            <div className="relative max-w-3xl mx-auto group">
                <input 
                  type="text" 
                  className="w-full bg-brand-dark p-6 rounded-2xl border border-brand-border text-text-primary placeholder:text-text-primary/30 outline-none focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all text-lg font-medium shadow-sm group-hover:shadow-lg" 
                  placeholder="Search for articles, guides, or troubleshooting..." 
                />
                <button className="absolute right-3 top-3 bg-brand px-8 py-3 rounded-xl text-white font-bold shadow-lg shadow-brand/20 hover:opacity-90 active:scale-95 transition-all">Search</button>
            </div>
          </div>
        </section>

        <section className="py-24 px-4">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                 <div className="text-center p-10 bg-brand-light rounded-[40px] border border-brand-border shadow-sm hover:shadow-2xl transition-all duration-300 group">
                    <div className="w-16 h-16 bg-brand/10 rounded-2xl flex items-center justify-center text-brand text-2xl mb-8 mx-auto group-hover:scale-110 transition-transform">
                        <i className="fas fa-rocket"></i>
                    </div>
                    <h3 className="text-2xl font-bold mb-4 text-text-primary">Getting Started</h3>
                    <p className="text-text-secondary opacity-80 text-sm mb-10 font-medium leading-relaxed">New to CollabSpace? Follow our quick-start guide to set up your first workspace in minutes.</p>
                    <Link to="/help/guides" className="text-brand font-bold hover:underline py-2 px-6 bg-brand/5 rounded-full transition-colors hover:bg-brand/10">View Guides</Link>
                 </div>
                 <div className="text-center p-10 bg-brand-light rounded-[40px] border border-brand-border shadow-sm hover:shadow-2xl transition-all duration-300 group">
                    <div className="w-16 h-16 bg-brand/10 rounded-2xl flex items-center justify-center text-brand text-2xl mb-8 mx-auto group-hover:scale-110 transition-transform">
                        <i className="fas fa-sync"></i>
                    </div>
                    <h3 className="text-2xl font-bold mb-4 text-text-primary">Platform Updates</h3>
                    <p className="text-text-secondary opacity-80 text-sm mb-10 font-medium leading-relaxed">Stay up to date with the latest features and bug fixes across web, desktop, and mobile.</p>
                    <Link to="/help/changelog" className="text-brand font-bold hover:underline py-2 px-6 bg-brand/5 rounded-full transition-colors hover:bg-brand/10">Changelog</Link>
                 </div>
                 <div className="text-center p-10 bg-brand-light rounded-[40px] border border-brand-border shadow-sm hover:shadow-2xl transition-all duration-300 group">
                    <div className="w-16 h-16 bg-brand/10 rounded-2xl flex items-center justify-center text-brand text-2xl mb-8 mx-auto group-hover:scale-110 transition-transform">
                        <i className="fas fa-headset"></i>
                    </div>
                    <h3 className="text-2xl font-bold mb-4 text-text-primary">Technical Support</h3>
                    <p className="text-text-secondary opacity-80 text-sm mb-10 font-medium leading-relaxed">Running into issues? Our technical support team is available 24/7 to help you troubleshoot.</p>
                    <Link to="/help/ticket" className="text-brand font-bold hover:underline py-2 px-6 bg-brand/5 rounded-full transition-colors hover:bg-brand/10">Open Ticket</Link>
                 </div>
            </div>
        </section>

        <FAQs />
      </div>
    </MainLayout>
  );
};

export default Help;
