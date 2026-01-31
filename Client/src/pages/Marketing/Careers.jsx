import React from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../../layout/MainLayout';
import JoinBeta from './components/JoinBeta';

const Careers = () => {
    const roles = [
        { title: "Senior Frontend Engineer", location: "Remote / SF", department: "Engineering" },
        { title: "Product Designer", location: "London / Remote", department: "Design" },
        { title: "Customer Success Manager", location: "SF / NY", department: "Sales" }
    ];

  return (
    <MainLayout>
      <div className="bg-brand-dark min-h-screen pt-20 transition-colors duration-300">
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-6xl font-extrabold text-text-primary mb-6">Join our <span className="text-brand">Team</span></h1>
              <p className="text-lg text-text-secondary max-w-2xl mx-auto font-medium">
                We're on a mission to redefine collaboration. Join us and help build the workspace of tomorrow.
              </p>
            </div>

            <div className="mt-20">
                <h2 className="text-2xl font-bold text-text-primary mb-8 border-b border-brand-border pb-4">Open <span className="text-brand">Positions</span></h2>
                <div className="space-y-4">
                    {roles.map((role, idx) => (
                        <div key={idx} className="bg-brand-light p-6 md:p-8 rounded-[32px] border border-brand-border flex flex-col md:flex-row justify-between items-start md:items-center hover:bg-brand-dark/5 transition-all group shadow-sm hover:shadow-2xl duration-300">
                            <div className="flex-1">
                                <h3 className="text-2xl font-black text-text-primary group-hover:text-brand transition-colors duration-300">{role.title}</h3>
                                <div className="flex items-center gap-3 mt-2">
                                    <span className="text-sm text-text-secondary font-bold uppercase tracking-widest opacity-60">{role.department}</span>
                                    <span className="w-1.5 h-1.5 bg-brand/30 rounded-full"></span>
                                    <span className="text-sm text-text-secondary font-bold opacity-60">{role.location}</span>
                                </div>
                            </div>
                            <Link 
                                to="/apply" 
                                state={{ jobTitle: role.title }} 
                                className="mt-8 md:mt-0 relative z-10 text-white bg-brand px-10 py-4 rounded-2xl text-base font-black hover:opacity-90 shadow-2xl shadow-brand/20 active:scale-95 transition-all block md:inline-block text-center whitespace-nowrap"
                            >
                                Apply Now
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
          </div>
        </section>
        <JoinBeta />
      </div>
    </MainLayout>
  );
};

export default Careers;
