import React from 'react'
import { Link } from 'react-router-dom'
import { RiArrowDropDownLine } from "react-icons/ri";
import { useTheme } from "../../context/ThemeContext";
import { FaSun, FaMoon } from "react-icons/fa";

const MobileMenu = ({ setMobileMenuOpen }) => {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <div className="md:hidden fixed z-40 right-0 animate-slide-left">
        <div className="flex flex-col mt-2 ml-40 px-6 py-8 space-y-6 max-w-[200px] bg-brand-light border border-brand-border rounded-2xl shadow-2xl relative z-50 backdrop-blur-xl transition-colors duration-300">
            <Link
                preventScrollReset={true}
                to="/"
                className="text-text-primary font-medium hover:text-brand transition-colors"
                onClick={() => setMobileMenuOpen(false)}
            >
                Home
            </Link>
            <Link
                preventScrollReset={true}
                to="/solutions"
                className="text-text-primary font-medium hover:text-brand transition-colors"
                onClick={() => setMobileMenuOpen(false)}
            >
                Solutions
            </Link>
            <Link
                preventScrollReset={true}
                to="/pricing"
                className="text-text-primary font-medium hover:text-brand transition-colors"
                onClick={() => setMobileMenuOpen(false)}
            >
                Pricing
            </Link>

            <Link
                preventScrollReset={true}
                to="/help"
                className="flex items-center gap-1 text-text-primary font-medium hover:text-brand transition-colors"
                onClick={() => setMobileMenuOpen(false)}
            >
                Resources
                <RiArrowDropDownLine className="text-2xl" />
            </Link>

            <div className="pt-4 border-t border-brand-border flex flex-col gap-4">
                <button
                    onClick={toggleTheme}
                    className="flex items-center justify-between w-full p-3 rounded-xl bg-brand-dark/20 text-text-primary transition-all active:scale-95 border border-brand-border"
                >
                    <span className="text-sm font-bold">Theme</span>
                    {theme === 'dark' ? <FaSun className="text-yellow-400" /> : <FaMoon className="text-blue-500" />}
                </button>

                <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="cursor-pointer py-3 px-4 border border-brand-border text-text-primary text-center font-bold hover:bg-brand-light transition rounded-xl"
                >
                    Login
                </Link>

                <Link
                    to="/request-demo"
                    onClick={() => setMobileMenuOpen(false)}
                    className="cursor-pointer py-3 px-4 bg-brand text-white text-center font-bold rounded-xl hover:opacity-90 transition active:scale-95 shadow-lg shadow-brand/20"
                >
                    Demo
                </Link>
            </div>
        </div>
    </div>
  )
}

export default React.memo(MobileMenu);
