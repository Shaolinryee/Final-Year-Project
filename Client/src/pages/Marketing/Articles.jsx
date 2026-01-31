import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../../layout/MainLayout';
import JoinBeta from './components/JoinBeta';
import { FaSearch, FaFilter, FaArrowRight } from 'react-icons/fa';

const Articles = () => {
    const allArticles = [
        { id: "1", title: "Streamline your workflow", date: "Dec 15, 2025", category: "Productivity", excerpt: "Discover productivity tips for modern teams to collaborate better.", author: "Shaolin Rai" },
        { id: "2", title: "Remote Work Excellence", date: "Dec 10, 2025", category: "Future of Work", excerpt: "How to maintain team cohesion while working from anywhere.", author: "Sarah Jenkins" },
        { id: "3", title: "Building the Future", date: "Dec 5, 2025", category: "Company", excerpt: "An update from our founders on the next chapter of CollabSpace.", author: "Team CollabWeb" },
        { id: "4", title: "Security Best Practices", date: "Nov 28, 2025", category: "Engineering", excerpt: "Protecting your team's sensitive data in a digital workspace.", author: "Security Team" },
        { id: "5", title: "The Power of Asynchronous Work", date: "Nov 20, 2025", category: "Productivity", excerpt: "Why real-time meetings might be slowing your team down.", author: "Shaolin Rai" },
        { id: "6", title: "Designing for Collaboration", date: "Nov 12, 2025", category: "Design", excerpt: "How our new interface was built for focus and team flow.", author: "UX Team" }
    ];

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    const categories = ['All', 'Productivity', 'Future of Work', 'Company', 'Engineering', 'Design'];

    const filteredArticles = allArticles.filter(article => {
        const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             article.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || article.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

  return (
    <MainLayout>
      <div className="bg-brand-dark min-h-screen pt-20 transition-colors duration-300">
        {/* Hero Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-brand-light/30 border-b border-brand-border">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold text-text-primary mb-6">Knowledge Base & <span className="text-brand">Articles</span></h1>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto mb-12 font-medium">
              Deep dives, tutorials, and insights into building more productive and connected teams.
            </p>

            <div className="flex flex-col md:flex-row items-center justify-center gap-4 max-w-3xl mx-auto">
                <div className="relative flex-1 w-full">
                    <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-text-primary/40" />
                    <input 
                        type="text" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-brand-dark border border-brand-border rounded-xl p-4 pl-12 text-text-primary placeholder:text-text-primary/30 outline-none focus:border-brand transition-all font-medium" 
                        placeholder="Search for articles..." 
                    />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <FaFilter className="text-text-primary opacity-40 ml-2" />
                    <select 
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="bg-brand-dark border border-brand-border rounded-xl p-4 text-text-primary outline-none focus:border-brand transition-all cursor-pointer flex-1 md:flex-none font-bold"
                    >
                        {categories.map(cat => <option key={cat} value={cat} className="bg-brand-light text-text-primary">{cat}</option>)}
                    </select>
                </div>
            </div>
          </div>
        </section>

        {/* Articles Grid */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {filteredArticles.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredArticles.map((article) => (
                    <Link key={article.id} to={`/blog/${article.id}`} className="bg-brand-light rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl border border-brand-border hover:border-brand/30 transition-all group flex flex-col h-full">
                        <div className="h-48 bg-brand/5 flex items-center justify-center border-b border-brand-border group-hover:bg-brand/10 transition-colors">
                            <div className="w-16 h-16 bg-brand/20 rounded-2xl flex items-center justify-center text-brand text-2xl font-bold">
                                {article.title.charAt(0)}
                            </div>
                        </div>
                        <div className="p-8 flex-1 flex flex-col">
                            <span className="text-brand text-xs font-bold uppercase tracking-widest">{article.category}</span>
                            <h2 className="text-2xl font-bold text-text-primary mt-2 mb-4 group-hover:text-brand transition-colors leading-tight">{article.title}</h2>
                            <p className="text-text-secondary text-sm mb-6 leading-relaxed flex-1 font-medium">{article.excerpt}</p>
                            <div className="flex items-center justify-between mt-auto pt-6 border-t border-brand-border">
                                <div className="text-xs">
                                    <p className="text-text-primary font-bold">{article.author}</p>
                                    <p className="text-text-secondary opacity-60 font-medium">{article.date}</p>
                                </div>
                                <span className="text-brand flex items-center gap-2 text-sm font-bold">
                                    Read <FaArrowRight className="text-xs group-hover:translate-x-1 transition-transform" />
                                </span>
                            </div>
                        </div>
                    </Link>
                ))}
                </div>
            ) : (
                <div className="text-center py-24 bg-brand-light rounded-[40px] border-2 border-dashed border-brand-border">
                    <h3 className="text-3xl font-bold text-text-primary mb-3">No articles found</h3>
                    <p className="text-text-secondary font-medium">Try adjusting your search or category filters.</p>
                </div>
            )}
          </div>
        </section>

        <JoinBeta />
      </div>
    </MainLayout>
  );
};

export default Articles;
