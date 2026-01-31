import React from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../../layout/MainLayout';
import JoinBeta from './components/JoinBeta';
import { FaBook, FaSearch, FaChevronRight } from 'react-icons/fa';

const HelpGuides = () => {
  const guides = [
    { slug: "setting-up-workspace", title: "Setting up your first workspace", duration: "5 min read", category: "Basics" },
    { slug: "managing-roles", title: "Inviting team members and managing roles", duration: "8 min read", category: "Team" },
    { slug: "custom-workflows", title: "Configuring custom workflows", duration: "12 min read", category: "Advanced" },
    { slug: "integrations", title: "Integrating with third-party apps", duration: "10 min read", category: "Integrations" }
  ];

  return (
    <MainLayout>
      <div className="bg-brand-dark min-h-screen pt-20 transition-colors duration-300">
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <header className="mb-16">
              <h1 className="text-4xl md:text-5xl font-extrabold text-text-primary mb-6">User <span className="text-brand">Guides</span></h1>
              <p className="text-lg text-text-secondary opacity-80 font-medium">Master CollabSpace with our step-by-step tutorials and documentation.</p>
            </header>

            <div className="relative mb-12 group">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-text-primary/40" />
                <input 
                  type="text" 
                  className="w-full bg-brand-light p-5 pl-12 rounded-2xl border border-brand-border text-text-primary placeholder:text-text-primary/30 outline-none focus:border-brand transition-all font-medium shadow-sm group-hover:shadow-lg" 
                  placeholder="Search guides..." 
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {guides.map((guide, idx) => (
                <Link to={`/help/guides/${guide.slug}`} key={idx} className="bg-brand-light p-10 rounded-[40px] border border-brand-border hover:border-brand/30 transition-all cursor-pointer group block shadow-sm hover:shadow-2xl">
                  <div className="flex justify-between items-start mb-6">
                    <span className="text-brand text-xs font-bold uppercase tracking-widest bg-brand/10 px-3 py-1 rounded-full">{guide.category}</span>
                    <span className="text-text-secondary opacity-40 text-xs font-bold">{guide.duration}</span>
                  </div>
                  <h3 className="text-2xl font-bold text-text-primary group-hover:text-brand transition-colors flex items-center gap-3">
                    <FaBook className="text-sm opacity-50" /> {guide.title}
                  </h3>
                  <div className="mt-8 flex items-center text-brand text-sm font-bold opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                    Read Guide <FaChevronRight className="ml-2 text-[10px]" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
        <JoinBeta />
      </div>
    </MainLayout>
  );
};

export default HelpGuides;
