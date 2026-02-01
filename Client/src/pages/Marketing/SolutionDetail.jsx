import React from 'react';
import { useParams, Link } from 'react-router-dom';
import MainLayout from '../../layout/MainLayout';
import JoinBeta from './components/JoinBeta';
import { FaRocket, FaShieldAlt, FaGraduationCap, FaBriefcase, FaCheckCircle, FaArrowRight } from 'react-icons/fa';

const solutionData = {
    "startups": {
        title: "Solutions for Startups",
        subtitle: "Move fast, stay organized, and build your vision with a clean, intuitive workspace.",
        icon: <FaRocket className="text-6xl text-blue-500" />,
        features: [
            { title: "Simple Setup", description: "Get your workspace running in minutes with intuitive Kanban boards." },
            { title: "Team Dashboard", description: "Get a clear view of all projects and task progress at a glance." },
            { title: "Flexible Structure", description: "Organize work your way as your team grows and evolves." }
        ],
        description: "In the early days of a startup, clarity is your unfair advantage. CollabWeb for Startups is designed to get out of your way and let you focus on what matters: building a great product. With our intuitive interface, you can set up your workspace and start collaborating in minutes."
    },
    "enterprises": {
        title: "For Growing Teams",
        subtitle: "Keep larger teams aligned with role-based permissions and activity tracking.",
        icon: <FaShieldAlt className="text-6xl text-blue-500" />,
        features: [
            { title: "Role-Based Permissions", description: "Control who can view, edit, or manage projects with Owner, Admin, and Member roles." },
            { title: "Activity Tracking", description: "Monitor team activity with comprehensive feeds showing all task updates." },
            { title: "Team Management", description: "Invite members, assign roles, and organize your growing workforce." }
        ],
        description: "Growing organizations need clear structure and accountability. CollabWeb provides the role-based access control and activity tracking needed to keep your team moving in the same direction. Our intuitive interface ensures everyone stays aligned."
    },
    "education": {
        title: "Education & Internships",
        subtitle: "Give students hands-on experience with professional project management tools.",
        icon: <FaGraduationCap className="text-6xl text-blue-500" />,
        features: [
            { title: "Collaborative Workspaces", description: "Create shared project boards for group assignments and team projects." },
            { title: "Internship Management", description: "Onboard interns with organized task boards and clear responsibilities." },
            { title: "Learning Environment", description: "Help students experience professional workflows in a supportive setting." }
        ],
        description: "Bridge the gap between the classroom and the workplace. By using CollabWeb in educational settings, students gain hands-on experience with real project management workflows. Perfect for group projects, capstone assignments, and internship programs."
    },
    "agencies": {
        title: "Agency Workspace",
        subtitle: "Manage multiple projects and keep client work organized in one clear workspace.",
        icon: <FaBriefcase className="text-6xl text-blue-500" />,
        features: [
            { title: "Project Organization", description: "Create separate project boards for each client to keep work clearly organized." },
            { title: "Team Collaboration", description: "Assign team members to projects and track progress with activity feeds." },
            { title: "Multi-Project View", description: "Switch between different project boards quickly and efficiently." }
        ],
        description: "Agencies thrive on organization and clarity. CollabWeb provides a centralized hub for all your project work, eliminating scattered task lists and keeping every project visible. Keep your team aligned and your projects on track."
    }
};

const SolutionDetail = () => {
  const { slug } = useParams();
  const solution = solutionData[slug] || solutionData["startups"];

  return (
    <MainLayout>
      <div className="bg-brand-dark min-h-screen pt-20 transition-colors duration-300">
        {/* Hero Section */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 border-b border-brand-border bg-brand-light/30">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16">
            <div className="w-full md:w-2/3">
                <span className="text-brand font-black uppercase tracking-[0.2em] text-sm mb-6 inline-block bg-brand/10 px-4 py-1.5 rounded-full">Industry Solution</span>
                <h1 className="text-4xl md:text-7xl font-black text-text-primary mb-8 leading-[1.1]">{solution.title}</h1>
                <p className="text-xl md:text-2xl text-text-secondary font-medium leading-relaxed max-w-2xl">{solution.subtitle}</p>
                <div className="mt-12 flex flex-wrap gap-6">
                     <Link to="/signup" className="group bg-brand text-white font-black py-5 px-10 rounded-[24px] shadow-2xl shadow-brand/20 hover:opacity-90 active:scale-95 transition-all flex items-center gap-3 text-lg">
                        Start for Free <FaArrowRight className="text-sm group-hover:translate-x-2 transition-transform" />
                     </Link>
                     <Link to="/request-demo" className="bg-brand-light text-text-primary font-black py-5 px-10 rounded-[24px] border border-brand-border hover:bg-brand-dark/50 transition-all text-lg active:scale-95">Request Demo</Link>
                </div>
            </div>
            <div className="w-full md:w-1/3 flex justify-center">
                <div className="w-64 h-64 md:w-80 md:h-80 bg-brand-light rounded-[40px] flex items-center justify-center p-12 border border-brand-border shadow-2xl relative group">
                    <div className="absolute inset-0 bg-brand/5 rounded-[40px] blur-2xl group-hover:blur-3xl transition-all"></div>
                    <div className="relative z-10 transform group-hover:scale-110 transition-transform duration-500 scale-125">
                        {React.cloneElement(solution.icon, { className: "text-7xl md:text-8xl text-brand" })}
                    </div>
                </div>
            </div>
          </div>
        </section>

        {/* Detailed Content */}
        <section className="py-32 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24 items-start">
                <div className="space-y-10 group">
                     <div className="inline-flex items-center gap-3 text-brand font-black text-lg mb-4">
                        <div className="w-8 h-1 bg-brand rounded-full"></div>
                        Why CollabSpace?
                     </div>
                     <p className="text-xl md:text-2xl text-text-primary/90 font-medium leading-loose italic border-l-4 border-brand pl-8 py-2">{solution.description}</p>
                     
                     <div className="space-y-6 pt-10">
                        <div className="flex items-center gap-5 text-text-primary group/item transition-all">
                            <div className="w-10 h-10 bg-brand/10 rounded-xl flex items-center justify-center text-brand group-hover/item:bg-brand group-hover/item:text-white transition-colors">
                                <FaCheckCircle />
                            </div>
                            <span className="text-lg font-bold">Unlimited projects and tasks</span>
                        </div>
                        <div className="flex items-center gap-5 text-text-primary group/item transition-all">
                            <div className="w-10 h-10 bg-brand/10 rounded-xl flex items-center justify-center text-brand group-hover/item:bg-brand group-hover/item:text-white transition-colors">
                                <FaCheckCircle />
                            </div>
                            <span className="text-lg font-bold">Real-time collaboration features</span>
                        </div>
                        <div className="flex items-center gap-5 text-text-primary group/item transition-all">
                            <div className="w-10 h-10 bg-brand/10 rounded-xl flex items-center justify-center text-brand group-hover/item:bg-brand group-hover/item:text-white transition-colors">
                                <FaCheckCircle />
                            </div>
                            <span className="text-lg font-bold">Role-based access control</span>
                        </div>
                     </div>
                </div>

                <div className="grid grid-cols-1 gap-8">
                    <h2 className="text-3xl md:text-4xl font-black text-text-primary mb-10 text-center lg:text-left">Key Capabilities</h2>
                    {solution.features.map((feature, idx) => (
                        <div key={idx} className="bg-brand-light p-10 rounded-[32px] border border-brand-border hover:border-brand/30 transition-all hover:shadow-2xl group shadow-sm">
                            <h3 className="text-2xl font-black text-text-primary mb-4 group-hover:text-brand transition-colors flex justify-between items-center">
                                {feature.title}
                                <div className="w-8 h-8 rounded-full bg-brand/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all scale-50 group-hover:scale-100">
                                    <FaArrowRight className="text-xs text-brand" />
                                </div>
                            </h3>
                            <p className="text-text-secondary font-medium leading-relaxed">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>

        <JoinBeta />
      </div>
    </MainLayout>
  );
};

export default SolutionDetail;
