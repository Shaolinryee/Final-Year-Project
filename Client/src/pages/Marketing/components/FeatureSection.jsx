import React from "react";
import HeroImage from "../../../assets/f1.jpg";
import Feature3 from "../../../assets/feature2.jpg";
import Feature1 from "../../../assets/feature3.jpg";

import { Link } from "react-router-dom";
import { FaChevronRight } from "react-icons/fa";
import { HiOutlineSquare3Stack3D } from "react-icons/hi2";

const FeatureSection = () => {
    const features = [
        {
            title: "Organize work visually",
            description: "Drag tasks across columns with intuitive Kanban boards designed for clarity.",
            image: HeroImage,
            link: "/features"
        },
        {
            title: "Role-based access control",
            description: "Define who can view, edit, or manage projects with Owner, Admin, and Member roles.",
            image: Feature3,
            link: "/features"
        },
        {
            title: "Real-time activity tracking",
            description: "Stay informed with activity feeds and notifications for every task update.",
            image: Feature1,
            link: "/features"
        }
    ];

  return (
    <div className="bg-brand-dark relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand/5 blur-[120px] rounded-full"></div>

      <section className="relative z-10 py-32 px-4 sm:px-6 lg:px-8 border-t border-brand-border">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-24">
            <span className="text-brand font-black uppercase tracking-[0.3em] text-sm mb-6 inline-block bg-brand/10 px-6 py-2 rounded-full">
              Powerful Capabilities
            </span>
            <h2 className="text-4xl md:text-7xl font-black text-text-primary mb-8 leading-[1.1]">
              Everything you need to <span className="text-brand">ship faster.</span>
            </h2>
            <p className="max-w-3xl mx-auto text-xl text-text-secondary font-medium leading-relaxed">
              Kanban boards, role-based permissions, and real-time collaboration—all built directly into one intuitive workspace designed for team clarity.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {features.map((feature, idx) => (
                <div 
                    key={idx}
                    className="group relative h-[500px] rounded-[48px] overflow-hidden border border-brand-border hover:border-brand/30 transition-all duration-500 shadow-sm hover:shadow-2xl bg-brand-light"
                >
                    {/* Background Image with Zoom Effect */}
                    <img 
                        src={feature.image} 
                        alt={feature.title} 
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-40 group-hover:opacity-50" 
                    />
                    
                    {/* Dynamic Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-light via-brand-light/80 to-transparent"></div>

                    {/* Content */}
                    <div className="absolute inset-0 p-12 flex flex-col justify-end">
                        <div className="mb-8 w-14 h-14 bg-brand/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-brand/20 group-hover:bg-brand group-hover:text-white transition-all duration-300">
                            <HiOutlineSquare3Stack3D className="text-brand text-2xl group-hover:text-white transition-colors" />
                        </div>
                        
                        <h3 className="text-3xl font-black text-text-primary mb-4 group-hover:text-brand transition-colors duration-300">
                            {feature.title}
                        </h3>
                        <p className="text-text-secondary font-medium mb-10 leading-relaxed text-lg">
                            {feature.description}
                        </p>

                        <Link
                            to={feature.link}
                            className="flex items-center gap-3 text-brand font-black text-base group/btn"
                        >
                            Explore feature
                            <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center group-hover/btn:bg-brand group-hover/btn:text-white transition-all">
                                <FaChevronRight className="text-[10px] group-hover/btn:translate-x-0.5 transition-transform" />
                            </div>
                        </Link>
                    </div>
                </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default FeatureSection;
