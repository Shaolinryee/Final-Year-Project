import React from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../../layout/MainLayout';
import JoinBeta from './components/JoinBeta';

const Blog = () => {
    const posts = [
        { id: "1", title: "Streamline your workflow", date: "Dec 15, 2025", category: "Productivity", excerpt: "Discover productivity tips for modern teams to collaborate better." },
        { id: "2", title: "Remote Work Excellence", date: "Dec 10, 2025", category: "Future of Work", excerpt: "How to maintain team cohesion while working from anywhere." },
        { id: "3", title: "Building the Future", date: "Dec 5, 2025", category: "Company", excerpt: "An update from our founders on the next chapter of CollabSpace." }
    ];

  return (
    <MainLayout>
      <div className="bg-brand-dark min-h-screen pt-20 transition-colors duration-300">
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-extrabold text-text-primary mb-12 text-center">Latest <span className="text-brand">Insights</span></h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {posts.map((post, idx) => (
                <div key={idx} className="bg-brand-light rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 border border-brand-border group">
                    <div className="h-48 bg-brand/5 flex items-center justify-center transition-colors group-hover:bg-brand/10 border-b border-brand-border">
                         <div className="w-12 h-12 bg-brand rounded-xl transform rotate-45 flex items-center justify-center shadow-lg shadow-brand/20">
                            <div className="w-5 h-5 bg-white rounded-full"></div>
                         </div>
                    </div>
                    <div className="p-8">
                         <span className="text-brand text-xs font-bold uppercase tracking-widest">{post.category}</span>
                         <h2 className="text-2xl font-bold text-text-primary mt-2 mb-4 group-hover:text-brand transition-colors leading-tight">{post.title}</h2>
                         <p className="text-text-secondary opacity-80 text-sm mb-8 leading-relaxed font-medium line-clamp-3">{post.excerpt}</p>
                         <div className="flex items-center justify-between pt-6 border-t border-brand-border">
                            <span className="text-xs text-text-secondary font-bold opacity-60 uppercase tracking-wider">{post.date}</span>
                            <Link to={`/blog/${post.id}`} className="text-brand text-sm font-bold hover:underline py-1 px-4 bg-brand/10 rounded-full transition-colors hover:bg-brand/20">Read More →</Link>
                         </div>
                    </div>
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

export default Blog;
