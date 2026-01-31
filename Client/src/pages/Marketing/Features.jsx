import React from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../../layout/MainLayout';
import JoinBeta from './components/JoinBeta';
import { FaTasks, FaUsers, FaRobot, FaLock, FaChartLine, FaMobileAlt } from 'react-icons/fa';

const Features = () => {
    const mainFeatures = [
        {
            title: "Advanced Task Management",
            description: "Break down complex projects into manageable tasks. Use subtasks, dependencies, and multiple progress views to keep everything on track.",
            icon: <FaTasks className="text-4xl text-blue-500" />,
            details: ["Custom Task Statuses", "File Attachments", "Priority Labels", "Time Tracking"]
        },
        {
            title: "Real-time Collaboration",
            description: "Bring your team together in a unified workspace. Communicate directly on tasks, mention colleagues, and see changes as they happen.",
            icon: <FaUsers className="text-4xl text-blue-500" />,
            details: ["Instant Mentions", "Live Updates", "Shared Workspaces", "Shared Calendars"]
        },
        {
            title: "Powerful Automations",
            description: "Reduce busywork with our automation engine. Set up custom triggers and actions to move cards, send notifications, and sync data seamlessly.",
            icon: <FaRobot className="text-4xl text-blue-500" />,
            details: ["Dynamic Triggers", "Auto-Transitions", "Slack/Email Alerts", "Custom Logic"]
        },
        {
            title: "Enterprise-Grade Security",
            description: "Your data is our top priority. Benefit from industry-leading security protocols, roles-based access control, and full data encryption.",
            icon: <FaLock className="text-4xl text-blue-500" />,
            details: ["2FA & SSO", "RBAC Permissions", "Data Encryption", "Compliance Ready"]
        },
        {
            title: "Insights & Analytics",
            description: "Visualize your team's performance. Our built-in reporting tools provide deep insights into velocity, bottlenecks, and project health.",
            icon: <FaChartLine className="text-4xl text-blue-500" />,
            details: ["Velocity Charts", "Burn-down Reports", "Resource Planning", "Custom Dashboards"]
        },
        {
            title: "Mobile Accessibility",
            description: "Stay connected from anywhere. Our mobile apps for iOS and Android ensure you never miss a beat, even when you're on the move.",
            icon: <FaMobileAlt className="text-4xl text-blue-500" />,
            details: ["Native Apps", "Offline Mode", "Push Notifications", "Seamless Sync"]
        }
    ];

  return (
    <MainLayout>
      <div className="bg-brand-dark min-h-screen pt-20 transition-colors duration-300">
        {/* Hero Section */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 text-center bg-brand-light/30">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-7xl font-extrabold text-text-primary mb-8 leading-tight">Everything you need to <span className="text-brand">collaborate faster.</span></h1>
            <p className="text-xl text-text-primary opacity-70 mb-12 font-medium">
                CollabWeb combines task management, team collaboration, and powerful automation in one intuitive platform designed for modern teams.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
                 <Link to="/signup" className="bg-brand hover:opacity-90 text-white font-bold py-4 px-10 rounded-xl transition-all shadow-xl shadow-brand/20 active:scale-95">Start for Free</Link>
                 <Link to="/request-demo" className="bg-brand-light/50 hover:bg-brand-light text-text-primary font-bold py-4 px-10 rounded-xl border border-brand-border transition-all shadow-sm">Watch Demo</Link>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="py-24 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                    {mainFeatures.map((f, idx) => (
                        <div key={idx} className="bg-brand-light p-10 rounded-3xl border border-brand-border hover:border-brand/30 transition-all group shadow-sm hover:shadow-xl">
                            <div className="mb-8 w-16 h-16 bg-brand/10 rounded-2xl flex items-center justify-center transition-colors group-hover:bg-brand/20">
                                {f.icon}
                            </div>
                            <h3 className="text-2xl font-bold text-text-primary mb-4">{f.title}</h3>
                            <p className="text-text-primary opacity-50 mb-8 leading-relaxed font-medium">{f.description}</p>
                            <ul className="space-y-3">
                                {f.details.map((detail, dIdx) => (
                                    <li key={dIdx} className="flex items-center gap-3 text-sm text-text-primary opacity-80 font-semibold">
                                        <div className="w-1.5 h-1.5 bg-brand rounded-full"></div>
                                        {detail}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </section>

        {/* Deep Dive Section (Visual Break) */}
        <section className="py-24 bg-brand/5 border-y border-brand-border">
            <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                <div>
                    <span className="text-brand font-bold uppercase tracking-widest text-sm mb-4 inline-block">Workflow Optimization</span>
                    <h2 className="text-3xl md:text-5xl font-bold text-text-primary mb-6">Build the perfect workflow for your team.</h2>
                    <p className="text-lg text-text-primary opacity-60 mb-8 leading-relaxed font-medium">
                        Don't let your tools dictate how you work. With CollabWeb, you can build custom boards, lists, and timelines that mirror your team's unique processes exactly.
                    </p>
                    <div className="space-y-6">
                        <div className="flex gap-4 p-6 bg-brand-light rounded-2xl border border-brand-border shadow-sm">
                            <div className="w-10 h-10 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center shrink-0 font-bold">1</div>
                            <div>
                                <h4 className="text-text-primary font-bold">Multiple Views</h4>
                                <p className="text-sm text-text-secondary font-medium">Switch between Board, Timeline, Calendar, and List views in one click.</p>
                            </div>
                        </div>
                        <div className="flex gap-4 p-6 bg-brand-light rounded-2xl border border-brand-border shadow-sm">
                            <div className="w-10 h-10 bg-brand/20 text-brand rounded-full flex items-center justify-center shrink-0 font-bold">2</div>
                            <div>
                                <h4 className="text-text-primary font-bold">Custom Fields</h4>
                                <p className="text-sm text-text-secondary font-medium">Track any piece of information with versatile custom fields for any task.</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="relative">
                    <div className="w-full aspect-square bg-brand/10 rounded-[40px] border border-brand/20 shadow-2xl flex items-center justify-center p-12 overflow-hidden">
                         {/* Static representation of a complex UI/Feature */}
                         <div className="w-full h-full bg-brand-dark rounded-2xl border border-brand-border p-6 relative shadow-lg">
                             <div className="w-2/3 h-4 bg-text-primary/10 rounded mb-4"></div>
                             <div className="w-full h-2 bg-text-primary/5 rounded mb-2"></div>
                             <div className="w-full h-2 bg-text-primary/5 rounded mb-8"></div>
                             <div className="grid grid-cols-2 gap-4">
                                 <div className="h-24 bg-brand/20 rounded-xl border border-brand/20"></div>
                                 <div className="h-24 bg-text-primary/5 rounded-xl"></div>
                                 <div className="h-24 bg-text-primary/5 rounded-xl"></div>
                                 <div className="h-24 bg-green-500/20 rounded-xl border border-green-500/20"></div>
                             </div>
                             <div className="absolute bottom-6 left-6 right-6 h-12 bg-text-primary/5 rounded-xl flex items-center px-4 gap-3">
                                 <div className="w-6 h-6 bg-brand rounded-full"></div>
                                 <div className="w-1/2 h-2 bg-text-primary/10 rounded"></div>
                             </div>
                         </div>
                    </div>
                    {/* Floating accents */}
                    <div className="absolute -top-6 -right-6 w-24 h-24 bg-brand/30 blur-2xl rounded-full"></div>
                    <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-green-500/20 blur-2xl rounded-full"></div>
                </div>
            </div>
        </section>

        <JoinBeta />
      </div>
    </MainLayout>
  );
};

export default Features;
