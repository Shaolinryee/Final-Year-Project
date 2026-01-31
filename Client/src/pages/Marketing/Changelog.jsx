import React from 'react';
import MainLayout from '../../layout/MainLayout';
import JoinBeta from './components/JoinBeta';

const Changelog = () => {
  const versions = [
    { 
        version: "v2.4.0", 
        date: "December 20, 2025", 
        title: "Enhanced Dark Mode & Team Dashboards",
        changes: [
            "Redesigned dark mode for better accessibility and focus.",
            "Introduced interactive team performance dashboards.",
            "New keyboard shortcuts for faster card movement.",
            "Improved mobile responsiveness for tablet devices."
        ]
    },
    { 
        version: "v2.3.5", 
        date: "December 5, 2025", 
        title: "Performance Optimization",
        changes: [
            "Reduced initial bundle size by 40% using lazy loading.",
            "Improved real-time sync latency for large projects.",
            "Fixed a bug where some notifications were delayed."
        ]
    }
  ];

  return (
    <MainLayout>
      <div className="bg-brand-dark min-h-screen pt-20 transition-colors duration-300">
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <header className="mb-24 text-center">
              <h1 className="text-4xl md:text-6xl font-extrabold text-text-primary mb-6">Product <span className="text-brand">Changelog</span></h1>
              <p className="text-lg text-text-secondary max-w-2xl mx-auto font-medium">Keep track of the latest updates, features, and improvements to CollabSpace.</p>
            </header>

            <div className="space-y-24 relative before:absolute before:left-0 md:before:left-1/2 before:top-0 before:bottom-0 before:w-px before:bg-brand-border">
              {versions.map((v, idx) => (
                <div key={idx} className="relative">
                  <div className="hidden md:block absolute left-1/2 -translate-x-1/2 w-5 h-5 bg-brand rounded-full border-4 border-brand-dark z-10 shadow-lg shadow-brand/20"></div>
                  <div className={`grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24 items-center`}>
                    <div className={`${idx % 2 !== 0 ? 'md:order-2 md:text-left' : 'md:text-right text-left'}`}>
                        <div className={`inline-flex items-center gap-2 bg-brand/10 text-brand px-4 py-1.5 rounded-full text-sm font-bold mb-4`}>
                            <span className="w-2 h-2 bg-brand rounded-full animate-pulse"></span>
                            {v.version}
                        </div>
                        <h2 className="text-3xl font-bold text-text-primary mb-3 leading-tight">{v.title}</h2>
                        <p className="text-text-secondary opacity-60 text-sm font-bold uppercase tracking-widest">{v.date}</p>
                    </div>
                    <div className={`bg-brand-light p-10 rounded-[40px] border border-brand-border shadow-sm hover:shadow-2xl transition-all duration-300 relative group`}>
                        <div className="absolute -top-4 -right-4 w-12 h-12 bg-brand/5 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-brand font-black">#</span>
                        </div>
                        <ul className="space-y-5">
                            {v.changes.map((change, cIdx) => (
                                <li key={cIdx} className="flex gap-4 text-text-primary opacity-80 text-sm font-medium leading-relaxed">
                                    <div className="w-6 h-6 bg-brand/10 rounded-lg flex items-center justify-center shrink-0">
                                        <div className="w-1.5 h-1.5 bg-brand rounded-full"></div>
                                    </div>
                                    <span>{change}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        <JoinBeta />
      </div>
    </MainLayout>
  );
};

export default Changelog;
