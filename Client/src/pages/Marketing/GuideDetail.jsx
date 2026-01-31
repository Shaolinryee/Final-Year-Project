import React from 'react';
import { useParams, Link } from 'react-router-dom';
import MainLayout from '../../layout/MainLayout';
import JoinBeta from './components/JoinBeta';
import { FaArrowLeft, FaClock, FaTag } from 'react-icons/fa';

const guideData = {
    "setting-up-workspace": {
        title: "Setting up your first workspace",
        category: "Basics",
        duration: "5 min read",
        content: `
            Welcome to CollabSpace! Setting up your first workspace is the first step toward better team collaboration. A workspace is a dedicated area for your team's projects, tasks, and communication.

            ### 1. Create your Workspace
            Click on the "+" icon in the sidebar and choose "New Workspace". Give it a name that represents your team or department (e.g., "Marketing" or "Product Development").

            ### 2. Configure Basic Settings
            Set your workspace logo, default time zone, and primary language to ensure consistency across the team.

            ### 3. Choose your First Template
            CollabSpace offers dozens of pre-built templates for KanBan, Scrum, and beyond. Start with our "Basic Task Tracker" if you're unsure where to begin.
        `
    },
    "managing-roles": {
        title: "Inviting team members and managing roles",
        category: "Team",
        duration: "8 min read",
        content: `
            Collaboration is at the heart of CollabSpace. This guide covers how to bring your team on board and ensure everyone has the right permissions.

            ### Inviting via Email
            Go to Workspace Settings > Members and enter the email addresses of your colleagues. They'll receive an invitation to join your workspace instantly.

            ### Understanding Roles
            *   **Admin**: Full control over settings, billing, and members.
            *   **Member**: Can create, edit, and move tasks within assigned projects.
            *   **Viewer**: Can view content and comment, but cannot make structural changes.
        `
    },
    "custom-workflows": {
        title: "Configuring custom workflows",
        category: "Advanced",
        duration: "12 min read",
        content: `
            Every team has a unique way of working. CollabSpace allows you to customize your workflow to match your specific processes.

            ### Custom Task Statuses
            Move beyond simple "To Do" and "Done". Create custom columns like "In Review", "QA", or "Pending Approval" to reflect your actual stage gates.

            ### Automated Transitions
            Set up rules to automatically move cards when certain conditions are met, such as moving a task to "QA" as soon as a PR is linked.
        `
    },
    "integrations": {
        title: "Integrating with third-party apps",
        category: "Integrations",
        duration: "10 min read",
        content: `
            CollabSpace works best when it's connected to the tools you already use every day.

            ### Slack Integration
            Get real-time updates on task changes directly in your Slack channels.

            ### GitHub & GitLab
            Link your code repositories to track development progress alongside your project tasks.
        `
    }
};

const GuideDetail = () => {
  const { slug } = useParams();
  const guide = guideData[slug] || guideData["setting-up-workspace"];

  return (
    <MainLayout>
      <div className="bg-brand-dark min-h-screen pt-20 transition-colors duration-300">
        <article className="max-w-4xl mx-auto px-4 py-16">
          <Link to="/help/guides" className="group flex items-center gap-3 text-brand font-black mb-12 transition-all hover:-translate-x-2">
            <div className="w-10 h-10 bg-brand/10 rounded-full flex items-center justify-center group-hover:bg-brand group-hover:text-white transition-colors">
              <FaArrowLeft size={14} />
            </div>
            <span>Back to Guides</span>
          </Link>

          <header className="mb-16">
            <div className="flex items-center gap-6 mb-6">
                <span className="flex items-center gap-2 bg-brand/10 text-brand px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-[0.2em]">
                    <FaTag className="text-[10px]" /> {guide.category}
                </span>
                <span className="flex items-center gap-2 text-text-secondary font-bold text-xs">
                    <FaClock className="text-[10px]" /> {guide.duration}
                </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-text-primary leading-[1.1]">{guide.title}</h1>
          </header>

          <div className="bg-brand-light p-10 md:p-16 rounded-[48px] border border-brand-border shadow-2xl transition-all duration-300">
            <div className="text-text-primary/90 text-lg md:text-xl leading-[1.8] font-medium space-y-10">
                {guide.content.split('\n').map((para, idx) => {
                    if (para.trim().startsWith('###')) {
                        return (
                            <div key={idx} className="relative pt-8">
                                <div className="absolute top-0 left-0 w-12 h-1.5 bg-brand rounded-full"></div>
                                <h3 className="text-3xl md:text-4xl font-black text-text-primary mb-6 leading-tight">{para.replace('###', '').trim()}</h3>
                            </div>
                        );
                    }
                    if (para.trim().startsWith('*')) {
                        return (
                            <li key={idx} className="flex gap-4 items-start ml-4 group">
                                <div className="w-2.5 h-2.5 bg-brand rounded-full mt-2.5 group-hover:scale-150 transition-transform"></div>
                                <span className="flex-1 font-bold italic">{para.replace('*', '').trim()}</span>
                            </li>
                        );
                    }
                    return para.trim() ? <p key={idx} className="opacity-80">{para.trim()}</p> : null;
                })}
            </div>
          </div>

          <div className="mt-20 p-12 bg-brand rounded-[40px] flex flex-col md:flex-row items-center justify-between gap-10 shadow-2xl shadow-brand/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl group-hover:scale-110 transition-transform duration-700"></div>
            <div className="text-center md:text-left relative z-10">
                <h3 className="text-3xl font-black text-white mb-3">Still need help?</h3>
                <p className="text-white opacity-80 text-lg font-medium">Our support team is available 24/7 for technical assistance.</p>
            </div>
            <Link to="/help/ticket" className="relative z-10 bg-white text-brand font-black py-5 px-10 rounded-[20px] hover:scale-105 active:scale-95 transition-all text-lg shadow-xl">
                Open a Ticket
            </Link>
          </div>
        </article>
        <JoinBeta />
      </div>
    </MainLayout>
  );
};

export default GuideDetail;
