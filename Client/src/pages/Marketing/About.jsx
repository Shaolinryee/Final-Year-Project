import React from 'react';
import MainLayout from '../../layout/MainLayout';
import Story from './components/Story';
import JoinBeta from './components/JoinBeta';

const About = () => {
  return (
    <MainLayout>
      <div className="bg-brand-dark min-h-screen pt-20 transition-colors duration-300">
        <section className="py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <span className="text-brand font-black uppercase tracking-[0.3em] text-sm mb-6 inline-block bg-brand/10 px-6 py-2 rounded-full">Our Purpose</span>
            <h1 className="text-5xl md:text-8xl font-black text-text-primary mb-8 leading-[1.1]"> Our <span className="text-brand">Mission</span> </h1>
            <p className="text-xl md:text-2xl text-text-secondary max-w-4xl mx-auto mb-12 font-medium leading-relaxed italic">
              "We empower teams to unleash their full potential through seamless collaboration and powerful project management tools, bridging the physical gap between vision and execution."
            </p>
          </div>
        </section>
        
        <div className="relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand/5 rounded-full blur-[120px] -z-10"></div>
            <Story />
        </div>
        
        <section className="py-32 bg-brand-light/50 transition-colors duration-300 relative border-y border-brand-border">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h2 className="text-4xl md:text-6xl font-black text-text-primary mb-16">Driven by <span className="text-brand">Innovation</span></h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <div className="p-12 bg-brand-light rounded-[48px] shadow-2xl hover:shadow-brand/10 transform hover:-translate-y-3 transition-all duration-500 border border-brand-border group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform"></div>
                <div className="w-16 h-1 bg-brand rounded-full mb-8 mx-auto group-hover:w-24 transition-all"></div>
                <h3 className="text-2xl font-black text-text-primary mb-4 group-hover:text-brand transition-colors">Integrity</h3>
                <p className="text-text-secondary font-medium leading-relaxed">We believe in transparent, radical, and honest communication in everything we do, building trust at every layer.</p>
              </div>
              <div className="p-12 bg-brand-light rounded-[48px] shadow-2xl hover:shadow-brand/10 transform hover:-translate-y-3 transition-all duration-500 border border-brand-border group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform"></div>
                <div className="w-16 h-1 bg-blue-500 rounded-full mb-8 mx-auto group-hover:w-24 transition-all"></div>
                <h3 className="text-2xl font-black text-text-primary mb-4 group-hover:text-blue-500 transition-colors">Collaboration</h3>
                <p className="text-text-secondary font-medium leading-relaxed">Success is a team sport. We move together as one, building tools that don't just connect screens, but connect people.</p>
              </div>
              <div className="p-12 bg-brand-light rounded-[48px] shadow-2xl hover:shadow-brand/10 transform hover:-translate-y-3 transition-all duration-500 border border-brand-border group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform"></div>
                <div className="w-16 h-1 bg-purple-500 rounded-full mb-8 mx-auto group-hover:w-24 transition-all"></div>
                <h3 className="text-2xl font-black text-text-primary mb-4 group-hover:text-purple-500 transition-colors">Customer First</h3>
                <p className="text-text-secondary font-medium leading-relaxed">Our users are our North Star. We obsess over their workflows to build features that solve real-world problems elegantly.</p>
              </div>
            </div>
          </div>
        </section>

        <JoinBeta />
      </div>
    </MainLayout>
  );
};

export default About;
