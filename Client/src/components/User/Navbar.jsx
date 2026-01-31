import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faTimes } from "@fortawesome/free-solid-svg-icons";
import { Link, useLocation } from "react-router-dom";
import { RiArrowDropDownLine, RiArrowDropUpLine } from "react-icons/ri";
import Resources from "./Resources";
import MobileMenu from "./MobileMenu";
import logo from '../../assets/logo.jpg'
import { useTheme } from "../../context/ThemeContext";
import { FaSun, FaMoon } from "react-icons/fa";

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const location = useLocation();

  return (
    <div style={{ fontFamily: "Inter, sans-serif" }}>
      <header className="fixed top-0 left-0 right-0 bg-brand-dark/80 backdrop-blur-md border-b border-brand-border shadow-xl z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between h-20">
            <div className="flex w-3xl space-x-5 px-4 lg:px-0">
          
              <Link
                to="/"
                className="flex items-center gap-2 text-text-primary cursor-pointer hover:text-brand transition"
              >
                {/* Logo Image (optional) */}
                                
  {/* <div className="w-10 h-14 rounded-lg flex items-center justify-center ml-1.5">
    <img src={logo} alt="Logo" className="w-full h-full object-contain" />
  </div>  */}
                  {/* Logo */}
              <div className="w-5 h-5 bg-[#0052CC] rounded-sm transform rotate-45 flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-full"></div>
            </div>

                <span className="font-bold text-[25px]">
                  CollabWeb
                </span>
              </Link>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center space-x-8">
                <Link
                  to="/features"
                  className="text-text-primary hover:text-brand transition font-medium"
                >
                  Features
                </Link>
                <Link
                  to="/solutions"
                  className="text-text-primary hover:text-brand transition font-medium"
                >
                  Solution
                </Link>
                <Link
                  to="/pricing"
                  className="text-text-primary hover:text-brand transition font-medium"
                >
                  Pricing
                </Link>
                <Link
                  to="/about"
                  className="text-text-primary hover:text-brand transition font-medium"
                >
                  About
                </Link>
                <button
                  onClick={() => setResourcesOpen(!resourcesOpen)}
                  className="flex items-center gap-1 text-text-primary hover:text-brand transition cursor-pointer font-medium"
                >
                    Resources
                  {resourcesOpen ? (
                    <RiArrowDropUpLine className="text-3xl" />
                  ) : (
                    <RiArrowDropDownLine className="text-3xl" />
                  )}
                
                </button>

                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-full bg-brand-light/30 border border-brand-border text-text-primary hover:bg-brand-light transition-all"
                  title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                  {theme === 'dark' ? <FaSun className="text-yellow-400" /> : <FaMoon className="text-blue-500" />}
                </button>
              </nav>
            </div>

            <div className="hidden md:flex gap-6 items-center px-4">
              <Link
                to="/articles"
                className="cursor-pointer py-2.5 px-6 bg-brand-light/30 border border-brand-border text-text-primary hover:bg-brand-light transition-all rounded-xl text-sm font-bold"
              >
                See all articles
              </Link>
              

              <Link to="/login" className="cursor-pointer py-2.5 px-7 bg-brand text-white rounded-xl hover:opacity-90 transition-all shadow-lg shadow-brand/20 active:scale-95 text-sm font-bold">
                Sign In
              </Link>
            </div>

            {/* Mobile Menu Button */}

            <button
              className="md:hidden cursor-pointer p-2 px-4"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <FontAwesomeIcon
                icon={mobileMenuOpen ? faTimes : faBars}
                className="text-2xl text-text-primary"
              />
            </button>
          </div>
        </div>

        {resourcesOpen && (
         <Resources/>
        )}

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
         <MobileMenu/>
        )}
      </header>
    </div>
  );
};

export default Navbar;
