import React from 'react';
import MainLayout from '../../layout/MainLayout';
import JoinBeta from './components/JoinBeta';
import { Link } from 'react-router-dom';
import { FaArrowRight } from 'react-icons/fa';

const Solutions = () => {
  return (
    <MainLayout>
      <div className="bg-brand-dark min-h-screen pt-20 transition-colors duration-300">
        <section className="py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
             <div className="text-center mb-24">
                <span className="text-brand font-black uppercase tracking-[0.3em] text-sm mb-6 inline-block bg-brand/10 px-6 py-2 rounded-full">Explore Possibilities</span>
                <h1 className="text-5xl md:text-8xl font-black text-text-primary mb-8 leading-[1.1]">Tailored <span className="text-brand">Solutions</span></h1>
                <p className="text-xl text-text-secondary max-w-3xl mx-auto font-medium leading-relaxed">
                    Whether you're a startup, a growing agency, or an enterprise, we have the features and expertise to scale your productivity to new heights.
                </p>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                 <div className="relative bg-brand-light p-12 rounded-[48px] border border-brand-border hover:border-brand/30 transition-all shadow-sm hover:shadow-2xl group overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand/5 rounded-full blur-3xl group-hover:scale-150 transition-transform"></div>
                    <div className="relative z-10">
                        <div className="w-16 h-1 w-24 bg-brand rounded-full mb-8"></div>
                        <h2 className="text-3xl font-black text-text-primary mb-6 group-hover:text-brand transition-colors">Startups</h2>
                        <p className="text-text-secondary font-medium text-lg mb-10 leading-relaxed italic">Move fast with minimal overhead. Our lean project management tools allow founders to focus on product-market fit and rapid scaling.</p>
                        <Link to="/solutions/startups" className="group/link inline-flex items-center gap-4 text-brand font-black text-xl">
                            <span>Learn more</span>
                            <div className="w-10 h-10 bg-brand/10 rounded-full flex items-center justify-center group-hover/link:bg-brand group-hover/link:text-white transition-all">
                                <FaArrowRight className="text-sm group-hover/link:translate-x-1 transition-transform" />
                            </div>
                        </Link>
                    </div>
                 </div>

                 <div className="relative bg-brand-light p-12 rounded-[48px] border border-brand-border hover:border-brand/30 transition-all shadow-sm hover:shadow-2xl group overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/5 rounded-full blur-3xl group-hover:scale-150 transition-transform"></div>
                    <div className="relative z-10">
                        <div className="w-16 h-1 w-24 bg-blue-500 rounded-full mb-8"></div>
                        <h2 className="text-3xl font-black text-text-primary mb-6 group-hover:text-blue-500 transition-colors">Enterprises</h2>
                        <p className="text-text-secondary font-medium text-lg mb-10 leading-relaxed italic">Scale with confidence. Built-in security, roles-based access control, and advanced reporting for complex global organizations.</p>
                        <Link to="/solutions/enterprises" className="group/link inline-flex items-center gap-4 text-blue-500 font-black text-xl">
                            <span>Learn more</span>
                            <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center group-hover/link:bg-blue-500 group-hover/link:text-white transition-all">
                                <FaArrowRight className="text-sm group-hover/link:translate-x-1 transition-transform" />
                            </div>
                        </Link>
                    </div>
                 </div>

                 <div className="relative bg-brand-light p-12 rounded-[48px] border border-brand-border hover:border-brand/30 transition-all shadow-sm hover:shadow-2xl group overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-500/5 rounded-full blur-3xl group-hover:scale-150 transition-transform"></div>
                    <div className="relative z-10">
                        <div className="w-16 h-1 w-24 bg-purple-500 rounded-full mb-8"></div>
                        <h2 className="text-3xl font-black text-text-primary mb-6 group-hover:text-purple-500 transition-colors">Education</h2>
                        <p className="text-text-secondary font-medium text-lg mb-10 leading-relaxed italic">Empower students and interns with professional tools. Our internship solutions provide the perfect collaborative environment for learning.</p>
                        <Link to="/solutions/education" className="group/link inline-flex items-center gap-4 text-purple-500 font-black text-xl">
                            <span>Learn more</span>
                            <div className="w-10 h-10 bg-purple-500/10 rounded-full flex items-center justify-center group-hover/link:bg-purple-500 group-hover/link:text-white transition-all">
                                <FaArrowRight className="text-sm group-hover/link:translate-x-1 transition-transform" />
                            </div>
                        </Link>
                    </div>
                 </div>

                 <div className="relative bg-brand-light p-12 rounded-[48px] border border-brand-border hover:border-brand/30 transition-all shadow-sm hover:shadow-xl group overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-green-500/5 rounded-full blur-3xl group-hover:scale-150 transition-transform"></div>
                    <div className="relative z-10">
                        <div className="w-16 h-1 w-24 bg-green-500 rounded-full mb-8"></div>
                        <h2 className="text-3xl font-black text-text-primary mb-6 group-hover:text-green-500 transition-colors">Agencies</h2>
                        <p className="text-text-secondary font-medium text-lg mb-10 leading-relaxed italic">Manage multiple clients and projects with surgical precision. Centralized communication ensures nothing falls through the cracks.</p>
                        <Link to="/solutions/agencies" className="group/link inline-flex items-center gap-4 text-green-500 font-black text-xl">
                            <span>Learn more</span>
                            <div className="w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center group-hover/link:bg-green-500 group-hover/link:text-white transition-all">
                                <FaArrowRight className="text-sm group-hover/link:translate-x-1 transition-transform" />
                            </div>
                        </Link>
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

export default Solutions;
