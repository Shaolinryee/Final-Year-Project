import React from 'react'
import HeroImage from "../../../assets/cttaa.jpg";
import { Link } from 'react-router-dom';

const CTA = () => {
  return (
    <section className="py-24 bg-brand-dark transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4">
        <div className="group relative rounded-[40px] p-12 md:p-24 flex flex-col items-center text-center overflow-hidden border border-brand-border shadow-2xl">
            {/* Background Image with Zoom */}
            <img 
                src={HeroImage} 
                alt="Newsletter Background" 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-40 dark:opacity-60 grayscale dark:grayscale-0" 
            />
            
            {/* Overlay that adapts to theme */}
            <div className="absolute inset-0 bg-gradient-to-br from-brand-dark/95 via-brand-dark/80 to-blue-500/20"></div>

            {/* Content */}
            <div className='relative z-10 max-w-2xl'>
                <span className="text-blue-500 font-bold uppercase tracking-widest text-sm mb-6 block">Stay in the loop</span>
                <h2 className="text-4xl md:text-6xl font-extrabold mb-6 text-text-primary leading-tight">Ready to ship <br /> <span className="text-blue-500">at the speed of light?</span></h2>
                <p className="mb-10 text-lg text-text-primary opacity-70 leading-relaxed">
                    Get updates on new features, tips, and stories from teams who have redefined productivity with CollabWeb.
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
                    <input
                        type="email"
                        placeholder="Enter your work email"
                        className="w-full px-6 py-4 bg-brand-light/30 border border-brand-border rounded-xl text-text-primary placeholder-text-primary/30 focus:outline-none focus:border-blue-500 backdrop-blur-md transition-all"
                    />
                    <button
                        className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-xl shadow-blue-600/20 transition-all active:scale-95 whitespace-nowrap"
                    >
                        Join Newsletter
                    </button>
                </div>
                
                <p className="mt-6 text-xs text-text-primary opacity-40">
                    We respect your inbox. Unsubscribe anytime.
                </p>
            </div> 
        </div>
      </div>
    </section>
  )
}

export default CTA
