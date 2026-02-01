import React from "react";
import Price from "../../../assets/move.jpg";
import { Link } from "react-router-dom";
import { FaChevronRight, FaRocket } from "react-icons/fa";

const MoveFaster = () => {
  return (
    <div className="bg-brand-dark transition-colors duration-300">
      <section className="py-24 px-4 sm:px-6 lg:px-8 border-t border-brand-border">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center text-center mb-16">
            <div className="w-16 h-16 bg-blue-600/10 rounded-2xl flex items-center justify-center border border-blue-500/10 mb-8">
                <FaRocket className="text-blue-500 text-2xl" />
            </div>
            <h2 className="text-4xl md:text-7xl font-extrabold text-text-primary mb-8 leading-tight">
                Ready to move <span className="text-blue-500">faster?</span>
            </h2>
            <p className="max-w-2xl mx-auto text-xl text-text-primary opacity-60 mb-12">
                Join teams getting organized and delivering better work every day. Simple setup, clear workflows, real results.
            </p>
            <div className="flex flex-col sm:flex-row gap-5">
                <Link
                    to="/signup"
                    className="px-10 py-5 bg-blue-600 text-white font-bold rounded-2xl shadow-2xl shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-95 flex items-center justify-center gap-3"
                >
                    Start for Free
                </Link>

                <Link
                    to="/request-demo"
                    className="px-10 py-5 bg-brand-light border border-brand-border text-text-primary font-bold rounded-2xl hover:border-blue-500/30 transition-all flex items-center justify-center gap-3 group shadow-lg"
                >
                    See Demo
                    <FaChevronRight className="text-[10px] group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>
          </div>

          <div className="relative group rounded-[40px] overflow-hidden border border-brand-border shadow-2xl h-[600px]">
                <img 
                    src={Price} 
                    alt="Accelerated workflow" 
                    className="w-full h-full object-cover grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000 dark:invert-0 invert dark:opacity-40 opacity-20" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-transparent to-transparent"></div>
                {/* Floating highlight */}
                <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-600/20 blur-[80px] rounded-full animate-pulse"></div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MoveFaster;
