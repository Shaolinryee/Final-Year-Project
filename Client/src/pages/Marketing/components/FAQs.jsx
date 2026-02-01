import React, { useState } from "react";
import { FaPlus, FaMinus } from "react-icons/fa";
import { Link } from "react-router-dom";

const FAQs = () => {
    const [activeIndex, setActiveIndex] = useState(0);

    const questions = [
        {
            q: "How secure is my data?",
            a: "We take security seriously. Your data is encrypted and stored securely. We use role-based access control (RBAC) to ensure only authorized team members can access specific projects and tasks."
        },
        {
            q: "Can I cancel or change plans anytime?",
            a: "Absolutely. CollabWeb is a monthly or yearly subscription service. You can upgrade, downgrade, or cancel your plan at any time through your billing dashboard without any hidden fees or long-term contracts."
        },
        {
            q: "Do you offer team training or onboarding?",
            a: "Yes! We provide comprehensive onboarding resources, including documentation and tutorials to help your team get started quickly. Our support team is also available via email to assist with any questions."
        },
        {
            q: "What collaboration features are included?",
            a: "CollabWeb includes real-time collaboration features such as task comments, file attachments, activity tracking, notifications, and team invitations. All team members can see updates instantly."
        },
        {
            q: "Is there a free version for small teams?",
            a: "We offer a 'Forever Free' tier for small teams and individuals that includes all essential project management features including Kanban boards, task management, and comments. You can scale to our Standard plan as your team grows."
        }
    ];

  return (
    <div className="bg-brand-dark relative overflow-hidden transition-colors duration-300">
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 blur-[100px] rounded-full"></div>
      
      <section className="relative z-10 py-32 px-4 sm:px-6 lg:px-8 border-t border-brand-border">
        <div className="max-w-4xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-20 text-left md:text-center">
            <span className="text-blue-500 font-bold uppercase tracking-widest text-sm mb-4 inline-block">Support</span>
            <h2 className="text-4xl md:text-6xl font-extrabold text-text-primary mb-6">Frequently Asked <span className="text-blue-500">Questions.</span></h2>
            <p className="text-lg text-text-primary opacity-60">Everything you need to know about the platform and billing.</p>
          </div>

          {/* FAQ Accordion */}
          <div className="space-y-4">
            {questions.map((item, idx) => (
                <div 
                    key={idx} 
                    className={`rounded-3xl border transition-all duration-300 overflow-hidden ${
                        activeIndex === idx ? 'bg-brand-light border-blue-500/30 shadow-xl shadow-blue-500/5' : 'bg-brand-light/20 border-brand-border hover:border-blue-500/20'
                    }`}
                >
                    <button 
                        onClick={() => setActiveIndex(activeIndex === idx ? -1 : idx)}
                        className="w-full p-8 flex items-center justify-between text-left group"
                    >
                        <span className={`text-xl font-bold transition-colors ${activeIndex === idx ? 'text-text-primary' : 'text-text-primary/60 group-hover:text-text-primary'}`}>
                            {item.q}
                        </span>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all ${
                            activeIndex === idx ? 'bg-blue-600 border-blue-600 text-white' : 'bg-brand-border/10 border-brand-border text-text-primary/40'
                        }`}>
                            {activeIndex === idx ? <FaMinus size={12} /> : <FaPlus size={12} />}
                        </div>
                    </button>
                    
                    <div className={`transition-all duration-300 ease-in-out ${
                        activeIndex === idx ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0'
                    }`}>
                        <div className="px-8 pb-8 text-text-primary opacity-50 leading-relaxed font-medium">
                            {item.a}
                        </div>
                    </div>
                </div>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="mt-20 p-10 bg-blue-600/10 rounded-[32px] border border-blue-500/20 text-center">
              <h3 className="text-2xl font-bold text-text-primary mb-3">Still have questions?</h3>
              <p className="text-text-primary opacity-60 mb-8 font-medium">Cant find the answer you're looking for? Please chat to our friendly team.</p>
              <Link
                to="/contact"
                className="px-8 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-xl shadow-blue-600/20 transition-all active:scale-95 flex items-center gap-2 mx-auto w-fit"
              >
                Get in touch
              </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FAQs;
