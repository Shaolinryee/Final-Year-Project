import React from 'react'
import Price from "../../../assets/pricing.jpg";
import f1 from "../../../assets/f1.jpg"
import f2 from "../../../assets/f2.jpg"

const SeeInAction = () => {
    const images = [
        { src: Price, label: "Unified Dashboard" },
        { src: f1, label: "Visual Kanban" },
        { src: f2, label: "Dynamic Timelines" }
    ];

  return (
    <div className="bg-brand-dark transition-colors duration-300">
      <section className="py-24 px-4 sm:px-6 lg:px-8 border-t border-brand-border">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <span className="text-blue-500 font-bold uppercase tracking-widest text-sm mb-4 inline-block">Visual Tour</span>
            <h2 className="text-4xl md:text-6xl font-extrabold text-text-primary mb-6">
              See it in <span className="text-blue-500">action.</span>
            </h2>
            <p className="max-w-2xl mx-auto text-lg text-text-primary opacity-60 font-medium">
              Explore the interface that teams love. From high-level dashboards to granular task details.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {images.map((img, idx) => (
                <div key={idx} className="group relative h-[450px] rounded-[32px] overflow-hidden border border-brand-border shadow-xl bg-brand-light/20">
                    <img 
                        src={img.src} 
                        alt={img.label} 
                        className="w-full h-full object-cover grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 dark:invert-0 invert dark:opacity-40 opacity-20" 
                    />
                    <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-brand-dark to-transparent">
                        <p className="text-text-primary font-bold text-xl group-hover:text-blue-500 transition-colors uppercase tracking-wider">{img.label}</p>
                    </div>
                </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default SeeInAction
