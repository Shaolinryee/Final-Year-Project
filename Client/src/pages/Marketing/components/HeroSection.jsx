import React from 'react';
import { Link } from 'react-router-dom';
import { FaChevronRight, FaPlayCircle } from 'react-icons/fa';
import HeroImage from "../../../assets/pricing.jpg";

const HeroSection = () => {
  return (
    <div className="bg-brand-dark relative overflow-hidden transition-colors duration-300">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand/10 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-brand/5 blur-[120px] rounded-full"></div>

      <section className="relative z-10 pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Column: Content */}
            <div className="flex flex-col gap-8 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand/5 border border-brand-border rounded-full w-fit">
                <span className="w-2 h-2 bg-brand rounded-full animate-pulse"></span>
                <span className="text-xs font-black text-text-primary uppercase tracking-wider">Simple & Powerful Task Management</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-black text-text-primary leading-[1.1]">
                Work together, <br />
                <span className="text-brand">ship faster.</span>
              </h1>
              
              <p className="text-xl text-text-secondary leading-relaxed max-w-xl font-medium">
                CollabSpace brings your team's work into focus. Manage projects, organize tasks, and collaborate with role-based permissions—all in one clean, intuitive workspace.
              </p>

              <div className="flex flex-wrap gap-5 pt-4">
                <Link
                  to="/signup"
                  className="px-8 py-4 bg-brand hover:opacity-90 text-white font-black rounded-xl shadow-2xl shadow-brand/20 transition-all active:scale-95 flex items-center gap-2"
                >
                  Start for Free
                  <FaChevronRight className="text-[10px]" />
                </Link>
                <Link
                  to="/request-demo"
                  className="px-8 py-4 bg-brand-light hover:bg-brand/5 text-text-primary font-black rounded-xl border border-brand-border transition-all flex items-center gap-2 group shadow-sm"
                >
                  <FaPlayCircle className="text-brand text-lg group-hover:scale-110 transition-transform" />
                  Watch Demo
                </Link>
              </div>

              <div className="flex items-center gap-4 pt-8 border-t border-brand-border">
                 <div className="flex -space-x-3">
                    {[1,2,3,4].map(i => (
                        <div key={i} className={`w-10 h-10 rounded-full border-2 border-brand-dark bg-brand-light flex items-center justify-center shadow-lg`}>
                            <div className="w-full h-full bg-brand/10 rounded-full"></div>
                        </div>
                    ))}
                 </div>
                 <p className="text-sm text-text-secondary font-bold">Trusted by <span className="text-text-primary">growing teams</span> worldwide</p>
              </div>
            </div>

            {/* Right Column: Visual */}
            <div className="relative group hidden lg:block">
                <div className="absolute -inset-2 bg-gradient-to-r from-brand/20 to-brand/40 gap-4 rounded-[40px] blur-2xl opacity-20 group-hover:opacity-30 transition duration-1000"></div>
                <div className="relative h-[650px] rounded-[40px] overflow-hidden border border-brand-border shadow-2xl">
                    <img 
                        src={HeroImage} 
                        alt="CollabWeb Platform Overview" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                    />
                    {/* Glass Overlay on image */}
                    <div className="absolute bottom-8 left-8 right-8 p-8 bg-brand-light/20 backdrop-blur-xl border border-brand-border/20 rounded-3xl shadow-2xl">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-text-primary font-black text-lg">Task Progress</p>
                                <p className="text-sm text-text-secondary font-bold opacity-70">12 of 18 tasks completed</p>
                            </div>
                            <div className="h-2 w-32 bg-brand/20 rounded-full overflow-hidden">
                                <div className="h-full w-2/3 bg-brand shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HeroSection;
