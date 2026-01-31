import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaCheckCircle, FaChevronRight } from "react-icons/fa";

const Pricing = () => {
  const [isYearly, setIsYearly] = useState(true);

  const tiers = [
    {
      name: "Free",
      price: "0",
      description: "Perfect for individuals and small side projects.",
      features: [
        "Up to 3 projects",
        "Unlimited tasks",
        "Basic collaboration",
        "Community support",
        "Standard file storage"
      ],
      buttonText: "Start for Free",
      link: "/signup",
      popular: false
    },
    {
      name: "Standard",
      price: isYearly ? "12" : "15",
      description: "Ideal for growing teams that need more power.",
      features: [
        "Unlimited projects",
        "Advanced task tracking",
        "Priority support",
        "Slack integration",
        "50GB storage",
        "Custom status labels"
      ],
      buttonText: "Get Started",
      link: "/signup",
      popular: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "Full governance and security for large organizations.",
      features: [
        "Unlimited everything",
        "Direct account manager",
        "SSO & SAML integration",
        "Audit logs & reporting",
        "Unlimited storage",
        "24/7 Phone support"
      ],
      buttonText: "Contact Sales",
      link: "/request-demo",
      popular: false
    }
  ];

  return (
    <section className="bg-brand-dark py-24 px-4 sm:px-6 lg:px-8 border-t border-brand-border overflow-hidden relative transition-colors duration-300">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-blue-600/5 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-extrabold text-text-primary leading-tight mb-6">
                Simple, transparent <br />
                <span className="text-blue-500">pricing for everyone.</span>
            </h2>
          <p className="text-lg text-text-primary opacity-60 max-w-2xl mx-auto mb-12">
            Choose the plan that fits your team's needs. Upgrade or downgrade at any time.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-16">
            <span className={`text-sm font-semibold transition-colors ${!isYearly ? 'text-text-primary' : 'text-text-primary/40'}`}>Monthly</span>
            <button 
                onClick={() => setIsYearly(!isYearly)}
                className="relative w-14 h-8 bg-blue-600/20 rounded-full p-1 transition-all border border-blue-500/20"
            >
                <div className={`w-6 h-6 bg-blue-600 rounded-full shadow-lg transform transition-transform ${isYearly ? 'translate-x-6' : 'translate-x-0'}`}></div>
            </button>
            <span className={`text-sm font-semibold transition-colors ${isYearly ? 'text-text-primary' : 'text-text-primary/40'}`}>Yearly</span>
            <span className="ml-2 px-3 py-1 bg-green-500/20 text-green-500 text-[10px] font-bold uppercase rounded-full border border-green-500/20">
                Save 20%
            </span>
          </div>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
          {tiers.map((plan, idx) => (
                <div 
                    key={idx} 
                    className={`relative p-8 rounded-[32px] border transition-all duration-300 flex flex-col ${
                        plan.popular 
                        ? 'bg-brand-light border-blue-500 shadow-2xl shadow-blue-500/10 scale-105 z-10' 
                        : 'bg-brand-light/50 border-brand-border hover:border-blue-500/30'
                    }`}
                >
                    {plan.popular && (
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
                            Most Popular
                        </div>
                    )}
                    
                    <div className="mb-8">
                        <p className="text-blue-500 font-bold uppercase tracking-widest text-xs mb-2">{plan.name}</p>
                        <div className="flex items-baseline gap-1">
                            {plan.price !== "Custom" && <span className="text-3xl font-bold text-text-primary">$</span>}
                            <span className="text-6xl font-extrabold text-text-primary">{plan.price}</span>
                            {plan.price !== "Custom" && <span className="text-text-primary/40 font-medium text-sm">{isYearly ? '/mo' : '/mo'}</span>}
                        </div>
                        <p className="mt-4 text-sm text-text-primary opacity-50 h-10">{plan.description}</p>
                    </div>

                    <ul className="space-y-4 mb-10 flex-1">
                        {plan.features.map((feature, fIdx) => (
                            <li key={fIdx} className="flex items-start gap-3 text-sm text-text-primary opacity-70">
                                <FaCheckCircle className="text-blue-500 mt-1 shrink-0" />
                                <span>{feature}</span>
                            </li>
                        ))}
                    </ul>

              <Link 
                to={plan.link}
                className={`w-full py-4 rounded-xl font-bold text-center transition-all flex items-center justify-center gap-2 active:scale-95 ${
                    plan.popular 
                        ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-blue-600/20' 
                        : 'bg-brand-border/10 text-text-primary hover:bg-brand-border/20 border border-brand-border'
                }`}
              >
                {plan.buttonText}
                <FaChevronRight className="text-[10px]" />
              </Link>
            </div>
          ))}
        </div>

        {/* Trust Footer */}
        <div className="mt-24 pt-16 border-t border-brand-border text-center">
            <p className="text-text-primary opacity-40 text-sm mb-12 italic">Join 50,000+ teams who scale faster with CollabWeb</p>
            <div className="flex flex-wrap justify-center gap-12 opacity-20 grayscale pointer-events-none filter brightness-50 dark:brightness-100 dark:invert-0 invert">
                <div className="h-6 w-24 bg-text-primary rounded"></div>
                <div className="h-6 w-32 bg-text-primary rounded"></div>
                <div className="h-6 w-20 bg-text-primary rounded"></div>
                <div className="h-6 w-28 bg-text-primary rounded"></div>
            </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
