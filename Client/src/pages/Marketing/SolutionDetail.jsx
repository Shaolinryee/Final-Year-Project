import React from 'react';
import { useParams, Link } from 'react-router-dom';
import MainLayout from '../../layout/MainLayout';
import JoinBeta from './components/JoinBeta';
import { FaRocket, FaShieldAlt, FaGraduationCap, FaBriefcase, FaCheckCircle, FaArrowRight } from 'react-icons/fa';

const solutionData = {
    "startups": {
        title: "Solutions for Startups",
        subtitle: "Move fast, build traction, and scale your vision without the administrative overhead.",
        icon: <FaRocket className="text-6xl text-blue-500" />,
        features: [
            { title: "Lean Methodology", description: "Minimalist project structures that adapt as fast as your roadmap does." },
            { title: "Founder-Centric Dashboards", description: "Get a high-level view of every department in a single click." },
            { title: "Seamless Scaling", description: "Transition from a 2-person team to a 200-person organization seamlessly." }
        ],
        description: "In the early days of a startup, speed is your only unfair advantage. CollabSpace for Startups is designed to get out of your way and let you focus on what matters: building a great product and finding product-market fit. With our lightweight templates and intuitive interface, you can set up your entire company's workflow in minutes, not days."
    },
    "enterprises": {
        title: "Enterprise Excellence",
        subtitle: "Unify complex organizations with advanced security, permissions, and cross-functional reporting.",
        icon: <FaShieldAlt className="text-6xl text-blue-500" />,
        features: [
            { title: "Advanced Permissions", description: "Roles-based access control to protect sensitive data across global teams." },
            { title: "Centralized Reporting", description: "Aggregate data from hundreds of projects into actionable executive insights." },
            { title: "Compliance Ready", description: "Built-in tools to help maintain SOC2, GDPR, and HIPAA compliance." }
        ],
        description: "Large organizations face unique challenges in alignment and communication. CollabSpace Enterprise provides the robust infrastructure and governance needed to keep thousands of employees moving in the same direction. Our enterprise-grade security and API-first approach ensure we fit perfectly into your existing tech stack."
    },
    "education": {
        title: "Education & Internships",
        subtitle: "Empower the next generation with professional-grade tools in a collaborative learning environment.",
        icon: <FaGraduationCap className="text-6xl text-blue-500" />,
        features: [
            { title: "Collaborative Classrooms", description: "Create shared workspaces for group projects and peer reviews." },
            { title: "Internship Management", description: "Onboard and mentor interns with structured tasks and feedback loops." },
            { title: "Resource Libraries", description: "Centralize course materials and student submissions in one secure place." }
        ],
        description: "Bridge the gap between the classroom and the workplace. By using CollabSpace in educational settings, students gain hands-on experience with the same tools used by top industry professionals. Our internship solutions specifically focus on mentorship and skill-building, allowing organizations to nurture talent effectively."
    },
    "agencies": {
        title: "Agency Powerhouse",
        subtitle: "Manage multiple clients, tight deadlines, and creative workflows with surgical precision.",
        icon: <FaBriefcase className="text-6xl text-blue-500" />,
        features: [
            { title: "Client Guest Access", description: "Invite clients into specific projects for transparent approvals and feedback." },
            { title: "Time Tracking & Invoicing", description: "Built-in tools to ensure every billable hour is accurately accounted for." },
            { title: "Multi-Project Overview", description: "Switch between client accounts and project boards in milliseconds." }
        ],
        description: "Agencies live and die by their ability to juggle competing priorities. CollabSpace for Agencies provides a centralized hub for all client work, eliminating the need for disjointed email threads and fragmented task lists. Increase your agency's billable efficiency and improve client satisfaction with world-class project transparency."
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
                            <span className="text-lg font-bold">Real-time collaborative editing</span>
                        </div>
                        <div className="flex items-center gap-5 text-text-primary group/item transition-all">
                            <div className="w-10 h-10 bg-brand/10 rounded-xl flex items-center justify-center text-brand group-hover/item:bg-brand group-hover/item:text-white transition-colors">
                                <FaCheckCircle />
                            </div>
                            <span className="text-lg font-bold">Custom workflows and automations</span>
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
