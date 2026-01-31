import React from "react";
import Price from "../../../assets/HeroImage.jpg";

const Proof = () => {
    const stats = [
        { label: "Active teams collaborating", value: "50K+" },
        { label: "Tasks completed monthly", value: "2M+" },
        { label: "Uptime guarantee", value: "99.9%" }
    ];

  return (
    <div className="bg-brand-dark transition-colors duration-300">
      <section className="py-24 px-4 sm:px-6 lg:px-8 border-y border-brand-border">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            {/* Stats Column */}
            <div className="flex flex-col gap-8 order-2 lg:order-1">
                <span className="text-blue-500 font-bold uppercase tracking-widest text-sm mb-2 block">Proven Results</span>
                <h2 className="text-4xl md:text-5xl font-bold text-text-primary mb-8">Trusted by teams <br /> world-wide.</h2>
                
                <div className="grid grid-cols-1 gap-6">
                    {stats.map((stat, idx) => (
                        <div key={idx} className="p-8 bg-brand-light/20 rounded-3xl border border-brand-border backdrop-blur-sm group hover:border-blue-500/30 transition-all">
                            <h3 className="text-5xl font-extrabold text-blue-500 mb-2 group-hover:scale-105 transition-transform inline-block">{stat.value}</h3>
                            <p className="text-text-primary opacity-50 font-semibold">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Visual Column */}
            <div className="relative h-[600px] rounded-[40px] overflow-hidden border border-brand-border shadow-2xl order-1 lg:order-2">
                <img src={Price} alt="Platform Usage" className="w-full h-full object-cover grayscale opacity-60 dark:opacity-40" />
                <div className="absolute inset-0 bg-gradient-to-r from-brand-dark via-transparent to-transparent lg:hidden"></div>
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-brand-dark to-transparent"></div>
                
                <div className="absolute bottom-10 left-10 right-10 p-8 pt-12 bg-brand-light/40 backdrop-blur-xl rounded-3xl border border-brand-border shadow-2xl">
                    <div className="flex gap-2 mb-4">
                        {[1,2,3,4,5].map(i => <div key={i} className="w-3 h-3 bg-blue-500 rounded-full"></div>)}
                    </div>
                    <p className="text-text-primary text-lg font-medium leading-relaxed italic">
                        "CollabWeb has become the backbone of our operations. The scale it handles while maintaining speed is truly impressive."
                    </p>
                    <p className="text-text-primary opacity-50 text-sm mt-4 font-bold uppercase tracking-wider">— Engineering Lead, GlobalScale</p>
                </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Proof;
