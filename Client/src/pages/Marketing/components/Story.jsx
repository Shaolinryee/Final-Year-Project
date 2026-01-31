import React from "react";
import Price from "../../../assets/pricing.jpg";
import { Link } from "react-router-dom";
import { FaChevronRight, FaHistory } from "react-icons/fa";

const Story = () => {
  return (
    <div className="bg-brand-dark transition-colors duration-300">
      <section className="py-24 px-4 sm:px-6 lg:px-8 border-t border-brand-border">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Content Column */}
            <div className="flex flex-col gap-8 order-2 lg:order-1">
                <div className="flex items-center gap-3 text-blue-500">
                    <FaHistory className="text-xl" />
                    <span className="font-bold uppercase tracking-widest text-sm">Our Journey</span>
                </div>
                
                <h2 className="text-4xl md:text-6xl font-extrabold text-text-primary leading-tight">
                    Building tools for the <span className="text-blue-500">next generation.</span>
                </h2>
                
                <p className="text-xl text-text-primary opacity-60 leading-relaxed">
                    CollabWeb was born from the simple idea that project management shouldn't be a chore. We believe in high-bandwidth collaboration, minimalist design, and tools that empower human creativity rather than slowing it down.
                </p>

                <div className="flex flex-wrap gap-5 pt-4">
                  <Link
                    to="/about"
                    className="px-8 py-4 bg-brand-light border border-brand-border hover:border-blue-500/30 text-text-primary font-bold rounded-xl transition-all flex items-center gap-2 group shadow-lg"
                  >
                    Learn More
                    <FaChevronRight className="text-[10px] group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    to="/about"
                    className="px-8 py-4 text-text-primary opacity-40 hover:opacity-100 font-bold transition-all flex items-center gap-2 hover:text-blue-500"
                  >
                    Our Mission
                  </Link>
                </div>
            </div>

            {/* Visual Column */}
            <div className="relative h-[500px] rounded-[40px] overflow-hidden border border-brand-border shadow-2xl order-1 lg:order-2 group">
                <img 
                    src={Price} 
                    alt="Our workspace" 
                    className="w-full h-full object-cover grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700 dark:invert-0 invert dark:opacity-40 opacity-20" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-transparent to-transparent"></div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Story;
