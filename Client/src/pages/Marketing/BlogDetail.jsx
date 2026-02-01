import React from 'react';
import { useParams, Link } from 'react-router-dom';
import MainLayout from '../../layout/MainLayout';
import JoinBeta from './components/JoinBeta';
import { FaArrowLeft } from 'react-icons/fa';

const blogPosts = {
    "1": {
        title: "Streamline your workflow",
        date: "Dec 15, 2025",
        category: "Productivity",
        author: "Shaolin Rai",
        content: `
            In today's fast-paced digital world, efficiency isn't just a luxury—it's a necessity. Teams that can streamline their workflows are better equipped to handle complex projects, meet tight deadlines, and maintain a healthy work-life balance. 
            
            At CollabSpace, we've spent years studying how the best teams work. What we've found is that it's rarely about working more hours; it's about reducing the 'work about work'—the endless meetings, Status checks, and fragmented communication that eat away at your day.
            
            ### Key Strategies for Streamlining
            1. **Centralize Communication**: Keep the conversation where the work happens with task comments and activity feeds.
            2. **Visualize Your Workflow**: Use Kanban boards to see exactly where work stands at any moment.
            3. **Limit Work in Progress**: Focusing on fewer tasks at once actually helps teams move faster overall.
        `,
        image: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
    },
    "2": {
        title: "Remote Work Excellence",
        date: "Dec 10, 2025",
        category: "Future of Work",
        author: "Sarah Jenkins",
        content: `
            Remote work is here to stay, but doing it well requires more than just a laptop and a Zoom account. It requires intentionality and the right set of tools to bridge the physical gap between team members.
            
            The biggest challenge in remote work is maintaining team cohesion and ensuring everyone feels connected to the mission. Without the casual interactions of an office, teams must create digital spaces for both structured work and informal connection.
            
            ### Essential Remote Habits
            *   **Over-communicate**: When you don't see each other, explicit updates become your lifeline.
            *   **Asynchronous First**: Respect deep work by defaulting to async communication unless a real-time sync is absolutely necessary.
            *   **Standardize Documentation**: Ensure that anyone, at any time, can find the information they need without asking.
        `,
        image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1351&q=80"
    }
};

const BlogDetail = () => {
  const { id } = useParams();
  const post = blogPosts[id] || blogPosts["1"]; // Fallback to first post if id not found

  return (
    <MainLayout>
      <div className="bg-brand-dark min-h-screen pt-20 transition-colors duration-300">
        <article className="max-w-4xl mx-auto px-4 py-20">
            <header className="mb-16 text-center">
                <span className="text-brand text-sm font-black uppercase tracking-[0.2em] mb-6 inline-block bg-brand/10 px-4 py-1.5 rounded-full">{post.category}</span>
                <h1 className="text-4xl md:text-7xl font-black text-text-primary mb-8 leading-[1.1]">{post.title}</h1>
                <div className="flex items-center justify-center gap-6 text-text-secondary font-bold text-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-brand rounded-full flex items-center justify-center text-white text-xs">
                            {post.author.charAt(0)}
                        </div>
                        <span>By {post.author}</span>
                    </div>
                    <span>•</span>
                    <span>{post.date}</span>
                </div>
            </header>

            <div className="w-full h-[500px] mb-16 rounded-[40px] overflow-hidden shadow-2xl border border-brand-border group">
                <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            </div>

            <div className="max-w-3xl mx-auto text-text-primary/90 text-lg md:text-xl leading-[1.8] font-medium space-y-8">
                {post.content.split('\n').map((para, idx) => {
                    if (para.trim().startsWith('###')) {
                        return <h3 key={idx} className="text-3xl md:text-4xl font-black text-text-primary mt-16 mb-6 leading-tight">{para.replace('###', '').trim()}</h3>;
                    }
                    if (para.trim().startsWith('*')) {
                        return (
                            <li key={idx} className="flex gap-4 items-start ml-4 group">
                                <div className="w-2 h-2 bg-brand rounded-full mt-3 group-hover:scale-150 transition-transform"></div>
                                <span className="flex-1 italic">{para.replace('*', '').trim()}</span>
                            </li>
                        );
                    }
                    if (para.trim().match(/^\d\./)) {
                        return (
                            <div key={idx} className="flex gap-4 items-start ml-4 group">
                                <span className="text-brand font-black text-2xl leading-none">{para.trim().split('.')[0]}.</span>
                                <span className="flex-1 font-black text-text-primary text-2xl">{para.trim().split('.').slice(1).join('.').trim()}</span>
                            </div>
                        );
                    }
                    return para.trim() ? <p key={idx} className="opacity-80">{para.trim()}</p> : null;
                })}
            </div>

            <footer className="mt-24 pt-12 border-t border-brand-border flex flex-col md:flex-row justify-between items-center gap-10">
                <div className="flex items-center gap-6 group">
                    <div className="w-16 h-16 bg-brand rounded-[20px] flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-brand/20 group-hover:rotate-6 transition-transform">
                        {post.author.charAt(0)}
                    </div>
                    <div>
                        <p className="text-text-primary font-black text-xl">{post.author}</p>
                        <p className="text-text-secondary font-bold text-xs uppercase tracking-widest opacity-60">Content Creator @ CollabSpace</p>
                    </div>
                </div>
                <Link to="/blog" className="group flex items-center gap-3 text-brand font-black text-lg transition-all hover:-translate-x-2">
                    <div className="w-10 h-10 bg-brand/10 rounded-full flex items-center justify-center group-hover:bg-brand group-hover:text-white transition-colors">
                        <FaArrowLeft size={14} />
                    </div>
                    <span>Back to Blog</span>
                </Link>
            </footer>
        </article>
        
        <JoinBeta />
      </div>
    </MainLayout>
  );
};

export default BlogDetail;
