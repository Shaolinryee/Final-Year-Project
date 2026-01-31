import React from "react";
import Feature1 from "../../../assets/feature3.jpg";
import { Link } from "react-router-dom";
import { FaChevronRight, FaShieldAlt, FaRocket, FaExchangeAlt } from "react-icons/fa";

const Benefits = () => {
    const benefits = [
        {
            title: "Boost Productivity",
            description: "Reduce time spent on manual tracking and increase team efficiency with optimized task flows.",
            icon: <FaRocket className="text-3xl text-blue-500" />,
            link: "/features"
        },
        {
            title: "Enterprise-Grade Security",
            description: "Your data remains private and protected with advanced encryption and roles-based access control.",
            icon: <FaShieldAlt className="text-3xl text-blue-500" />,
            link: "/features"
        },
        {
            title: "Seamless Integration",
            description: "Connect with your favorite tools and platforms without friction using our robust API and marketplace.",
            icon: <FaExchangeAlt className="text-3xl text-blue-500" />,
            link: "/features"
        }
    ];

  return (
    <div className="bg-brand-dark relative overflow-hidden transition-colors duration-300">
      {/* Decorative Blob */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/5 blur-[100px] rounded-full"></div>

      <section className="relative z-10 py-24 px-4 sm:px-6 lg:px-8 border-t border-brand-border">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-20">
            <span className="text-blue-500 font-bold uppercase tracking-widest text-sm mb-4 inline-block">
              Why Teams Choose Us
            </span>
            <h2 className="text-4xl md:text-6xl font-extrabold text-text-primary mb-6 leading-tight">
              Transform the way <br />
              <span className="text-blue-500">your team works.</span>
            </h2>
            <p className="max-w-2xl mx-auto text-lg text-text-primary opacity-60">
                CollabWeb provides the foundation for high-performing teams to plan, track, and execute with absolute clarity.
            </p>
          </div>

          {/* Benefits Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-8 flex flex-col justify-between">
                {benefits.map((benefit, idx) => (
                    <div 
                        key={idx} 
                        className="group flex gap-6 p-8 bg-brand-light/20 rounded-3xl border border-brand-border hover:border-blue-500/30 transition-all duration-300 backdrop-blur-sm"
                    >
                        <div className="w-16 h-16 bg-blue-600/10 rounded-2xl flex items-center justify-center border border-blue-500/10 shrink-0 group-hover:bg-blue-600/20 transition-colors">
                            {benefit.icon}
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-text-primary mb-3 group-hover:text-blue-500 transition-colors">
                                {benefit.title}
                            </h3>
                            <p className="text-text-primary opacity-50 mb-6 leading-relaxed">
                                {benefit.description}
                            </p>
                            <Link to={benefit.link} className="inline-flex items-center gap-2 text-sm font-bold text-text-primary/40 hover:text-blue-500 transition-colors">
                                Learn more <FaChevronRight className="text-[10px]" />
                            </Link>
                        </div>
                    </div>
                ))}
            </div>

            {/* Visual Side */}
            <div className="relative h-[600px] lg:h-auto rounded-[40px] overflow-hidden border border-brand-border shadow-2xl group">
                <img 
                    src={Feature1} 
                    alt="Team productivity" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80 dark:opacity-100" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-transparent to-transparent"></div>
                
                {/* Floating Stat Card */}
                <div className="absolute bottom-10 left-10 p-8 bg-brand-light/80 backdrop-blur-xl border border-brand-border rounded-3xl shadow-2xl max-w-sm">
                    <div className="flex gap-4 mb-4">
                        <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                            <FaRocket className="text-green-500" />
                        </div>
                        <div>
                            <p className="text-text-primary font-bold text-xl">250% Increase</p>
                            <p className="text-text-primary opacity-50 text-xs font-bold uppercase tracking-wider">In team velocity</p>
                        </div>
                    </div>
                    <p className="text-text-primary opacity-60 text-sm italic">
                        "Since adopting CollabWeb, our engineering cycles have shortened significantly. It's the engine behind our growth."
                    </p>
                </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Benefits;
