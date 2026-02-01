import React from "react";
import Feature1 from "../../../assets/feature3.jpg";
import { IoStar } from "react-icons/io5";

const Testimonials = () => {
    const testimonials = [
        {
            name: "Anjal Rai",
            role: "CTO, TechInnovate",
            quote: "CollabWeb transformed how we manage complex projects across multiple teams. The Kanban boards keep everyone aligned.",
            avatar: Feature1
        },
        {
            name: "Sidhartha Shrestha",
            role: "Operations Director, GlobalSolutions",
            quote: "Our team collaboration improved significantly after implementing CollabWeb. It's rare to find a tool that teams actually love using.",
            avatar: Feature1
        },
        {
            name: "Shaolin Rai",
            role: "Project Manager, CreativeSpark",
            quote: "The intuitive interface made onboarding our team seamless. We were organized and productive within hours.",
            avatar: Feature1
        }
    ];

  return (
    <div className="bg-brand-dark transition-colors duration-300">
      <section className="py-32 px-4 sm:px-6 lg:px-8 border-b border-brand-border">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-24">
            <span className="text-blue-500 font-bold uppercase tracking-widest text-sm mb-4 inline-block">
                Customer Stories
            </span>
            <h2 className="text-4xl md:text-6xl font-extrabold text-text-primary mb-6">
                Loved by teams <br /> <span className="text-blue-500">around the world.</span>
            </h2>
            <p className="max-w-2xl mx-auto text-lg text-text-primary opacity-60">
                Join teams who have improved their workflow with CollabWeb's intuitive task management.
            </p>
          </div>

          {/* Testimonials Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((t, idx) => (
                <div 
                    key={idx} 
                    className="flex flex-col p-10 bg-brand-light/30 rounded-[32px] border border-brand-border hover:border-blue-500/30 transition-all duration-300 backdrop-blur-sm group"
                >
                    <div className="flex gap-1 mb-8">
                        {[1,2,3,4,5].map(i => (
                            <IoStar key={i} className="text-blue-500 text-sm" />
                        ))}
                    </div>

                    <p className="text-text-primary text-lg leading-relaxed mb-10 flex-1">
                        "{t.quote}"
                    </p>

                    <div className="flex items-center gap-4 pt-8 border-t border-brand-border">
                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-blue-500/20 group-hover:border-blue-500 transition-colors">
                            <img
                                src={t.avatar}
                                alt={t.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div>
                            <p className="text-text-primary font-bold text-sm">{t.name}</p>
                            <p className="text-text-primary opacity-40 text-xs font-medium">{t.role}</p>
                        </div>
                    </div>
                </div>
            ))}
          </div>

          {/* Bottom Social Proof */}
          <div className="mt-24 pt-16 flex flex-col items-center border-t border-brand-border">
              <p className="text-text-primary opacity-30 text-xs font-bold uppercase tracking-[0.2em] mb-12">Trusted by builders at</p>
              <div className="flex flex-wrap justify-center gap-16 opacity-20 grayscale filter brightness-0 invert shadow-inner dark:invert-0">
                  {/* Mock partner logo placeholders */}
                  <div className="h-6 w-24 bg-text-primary rounded"></div>
                  <div className="h-6 w-32 bg-text-primary rounded"></div>
                  <div className="h-6 w-20 bg-text-primary rounded"></div>
                  <div className="h-6 w-28 bg-text-primary rounded"></div>
                  <div className="h-6 w-24 bg-text-primary rounded"></div>
              </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Testimonials;
