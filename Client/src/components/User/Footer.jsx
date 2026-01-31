import React from "react";
import { IoMdMail } from "react-icons/io";
import { Link } from "react-router-dom";
import { FaFacebook, FaInstagram, FaTwitter, FaLinkedin, FaYoutube } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="w-full bg-brand-dark border-t border-brand-border transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between flex-col py-16 gap-14 lg:gap-20 min-[1124px]:flex-row">
          <div className="block xl:max-w-lg">
            <Link
              to="/"
              className="flex justify-center min-[1124px]:justify-start mb-6"
            >
               <div className="w-6 h-6 bg-[#0052CC] rounded-sm transform rotate-45 flex items-center justify-center mr-3">
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                </div>
              <h1 className="text-2xl font-bold text-text-primary">CollabWeb</h1>
            </Link>
            <p className="text-base text-text-primary opacity-50 mb-9 text-center min-[1124px]:text-left leading-relaxed font-medium">
              Stay informed about CollabWeb features, industry trends, and product updates. Join our global community of innovators.
            </p>
            <div className="relative lg:flex-row gap-3 flex-col flex items-center justify-between max-[1124px]:max-w-2xl max-[1124px]:mx-auto ">
              <div className="relative w-full flex-1 group">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 z-10">
                    <IoMdMail className="text-blue-500 h-[20px] w-[20px]"/>
                </span>
                <input
                    type="email"
                    name="email"
                    className="py-4 px-5 pl-14 bg-brand-light/20 border border-brand-border rounded-xl text-text-primary placeholder:text-text-primary/30 focus:outline-none focus:border-blue-500 w-full backdrop-blur-md transition-all"
                    placeholder="Enter your email"
                />
              </div>
              <button
                type="submit"
                className="h-14 py-3.5 px-8 bg-blue-600 text-white font-bold rounded-xl shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-95 whitespace-nowrap"
              >
                Subscribe
              </button>
            </div>
          </div>

          <div className="flex flex-col items-center sm:items-start min-[530px]:flex-row max-[1124px]:w-full max-[1124px]:justify-between gap-12 xl:gap-24 max-[1124px]:max-w-2xl max-[1124px]:mx-auto">
            <div className="block">
              <h4 className="text-sm uppercase tracking-widest text-blue-500 font-bold mb-8 whitespace-nowrap">
                Product
              </h4>
              <ul className="grid gap-4 text-center lg:text-left">
                <li><Link to="/features" className="text-sm text-text-primary opacity-50 hover:text-blue-500 hover:opacity-100 transition-all font-semibold">Features</Link></li>
                <li><Link to="/solutions" className="text-sm text-text-primary opacity-50 hover:text-blue-500 hover:opacity-100 transition-all font-semibold">Solutions</Link></li>
                <li><Link to="/pricing" className="text-sm text-text-primary opacity-50 hover:text-blue-500 hover:opacity-100 transition-all font-semibold">Pricing</Link></li>
                <li><Link to="/help" className="text-sm text-text-primary opacity-50 hover:text-blue-500 hover:opacity-100 transition-all font-semibold">Help Center</Link></li>
              </ul>
            </div>
            <div className="block">
              <h4 className="text-sm uppercase tracking-widest text-blue-500 font-bold mb-8 text-center lg:text-left">
                Company
              </h4>
              <ul className="grid gap-4 text-center lg:text-left">
                <li><Link to="/about" className="text-sm text-text-primary opacity-50 hover:text-blue-500 hover:opacity-100 transition-all font-semibold">About Us</Link></li>
                <li><Link to="/careers" className="text-sm text-text-primary opacity-50 hover:text-blue-500 hover:opacity-100 transition-all font-semibold">Careers</Link></li>
                <li><Link to="/blog" className="text-sm text-text-primary opacity-50 hover:text-blue-500 hover:opacity-100 transition-all font-semibold">Blog</Link></li>
                <li><Link to="/contact" className="text-sm text-text-primary opacity-50 hover:text-blue-500 hover:opacity-100 transition-all font-semibold">Contact</Link></li>
              </ul>
            </div>
            <div className="block">
              <h4 className="text-sm uppercase tracking-widest text-blue-500 font-bold mb-8 text-center lg:text-left">
               Social
              </h4>
              <div className="flex gap-5">
                {[FaFacebook, FaTwitter, FaLinkedin, FaInstagram].map((Icon, idx) => (
                    <a key={idx} href="#" className="w-10 h-10 bg-brand-light/20 rounded-full flex items-center justify-center border border-brand-border hover:border-blue-500/50 hover:bg-blue-600/10 transition-all text-text-primary/50 hover:text-blue-500 shadow-sm">
                        <Icon />
                    </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="py-10 border-t border-brand-border">
          <div className="flex items-center justify-center flex-col gap-6 sm:flex-row sm:justify-between">
            <span className="text-xs text-text-primary opacity-30 font-bold">
              © {new Date().getFullYear()} CollabWeb Inc. All rights reserved.
            </span>
            <div className="flex space-x-8">
              <Link to="#" className="text-xs text-text-primary opacity-30 hover:text-blue-500 hover:opacity-100 transition-all font-bold">Privacy Policy</Link>
              <Link to="#" className="text-xs text-text-primary opacity-30 hover:text-blue-500 hover:opacity-100 transition-all font-bold">Terms of Service</Link>
              <Link to="#" className="text-xs text-text-primary opacity-30 hover:text-blue-500 hover:opacity-100 transition-all font-bold">Cookie Settings</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
