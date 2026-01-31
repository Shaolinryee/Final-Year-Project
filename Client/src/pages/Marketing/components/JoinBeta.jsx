import React from "react";
import Price from "../../../assets/cta.jpg";
import { Link } from "react-router-dom";
import { FaChevronRight } from "react-icons/fa";

const JoinBeta = () => {
  return (
    <div className="bg-brand-dark transition-colors duration-300">
      <section className="py-24 px-4 sm:px-6 lg:px-8 border-t border-brand-border">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Content side */}
            <div className="flex flex-col gap-8">
                <span className="text-blue-500 font-bold uppercase tracking-widest text-sm mb-2 block">Early Access</span>
                <h2 className="text-4xl md:text-6xl font-extrabold text-text-primary leading-tight">
                    Join the <span className="text-blue-500">exclusive beta.</span>
                </h2>
                <p className="text-xl text-text-primary opacity-60 leading-relaxed max-w-xl">
                    Get early access to our upcoming enterprise features and help us shape the future of collaborative work management.
                </p>
                
                <div className="flex flex-col gap-4 max-w-md">
                    <div className="flex items-center gap-4">
                        <input
                            type="email"
                            placeholder="Enter your work email"
                            className="flex-1 px-6 py-4 bg-brand-light/30 border border-brand-border rounded-xl text-text-primary placeholder-text-primary/30 focus:outline-none focus:border-blue-500 transition-all backdrop-blur-sm"
                        />
                        <button className="px-8 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-xl shadow-blue-600/20 transition-all active:scale-95">
                            Join
                        </button>
                    </div>
                    <p className="text-xs text-text-primary opacity-30 flex items-center gap-2">
                        <span className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></span>
                        342 teams already in the waitlist
                    </p>
                </div>

                <div className="pt-8 border-t border-brand-border">
                    <Link to="/contact" className="text-sm font-bold text-text-primary hover:text-blue-500 transition-colors flex items-center gap-2 group">
                        Have questions? Talk to us. 
                        <FaChevronRight className="text-[10px] group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </div>

            {/* Visual side */}
            <div className="relative group rounded-[40px] overflow-hidden border border-brand-border shadow-2xl h-[500px]">
                <img 
                    src={Price} 
                    alt="Platform in action" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-80 transition-all dark:invert-0 invert dark:opacity-40 opacity-20" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-transparent to-transparent"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-blue-600/20 backdrop-blur-xl border border-blue-500/20 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-600 hover:scale-110 transition-all shadow-2xl group/play">
                     <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[15px] border-l-white border-b-[10px] border-b-transparent ml-1 group-hover:scale-110 transition-transform"></div>
                </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default JoinBeta;
