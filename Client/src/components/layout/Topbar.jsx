/**
 * Topbar Component
 * Minimal topbar with profile dropdown, theme toggle, and logout
 */

import { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import {
  LogOut,
  ChevronDown,
  User,
  Settings,
  Menu,
  ChevronRight,
  Sun,
  Moon,
} from "lucide-react";
import { projectsApi, tasksApi } from "../../services/api";

const Topbar = ({ onToggleSidebar }) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { projectId, taskId } = useParams();
  
  // State for dynamic breadcrumb names
  const [projectName, setProjectName] = useState("");
  const [taskTitle, setTaskTitle] = useState("");

  // Fetch project/task names for breadcrumb
  useEffect(() => {
    if (projectId) {
      projectsApi.getById(projectId).then(({ data }) => {
        if (data) setProjectName(data.name);
      });
    }
    if (taskId) {
      tasksApi.getById(taskId).then(({ data }) => {
        if (data) setTaskTitle(data.title);
      });
    }
  }, [projectId, taskId]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  // Generate breadcrumb segments
  const getBreadcrumbs = () => {
    const path = location.pathname;
    const segments = path.split("/").filter(Boolean);
    const breadcrumbs = [];
    
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      const fullPath = "/" + segments.slice(0, i + 1).join("/");
      
      // Skip IDs in display but keep for navigation
      if (segment.match(/^[a-f0-9-]{20,}$/i)) {
        // This is a project or task ID
        if (segments[i - 1] === "projects" && projectName) {
          breadcrumbs.push({ label: projectName, path: fullPath });
        } else if (segments[i - 1] === "tasks" && taskTitle) {
          breadcrumbs.push({ label: taskTitle, path: fullPath });
        }
        continue;
      }
      
      // Format segment for display
      const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");
      breadcrumbs.push({ label, path: fullPath });
    }
    
    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  const getInitials = (email) => {
    if (!email) return "U";
    return email.charAt(0).toUpperCase();
  };

  return (
    <header className="h-14 bg-brand-light border-b border-brand-border flex items-center justify-between px-4 flex-shrink-0 transition-colors duration-300">
      {/* Left - Mobile menu toggle + Breadcrumb */}
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg hover:bg-brand-dark/50 text-text-secondary hover:text-text-primary transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        <nav className="flex items-center text-sm">
          {breadcrumbs.map((crumb, index) => (
            <span key={crumb.path} className="flex items-center">
              {index > 0 && (
                <ChevronRight className="w-4 h-4 text-text-secondary mx-1" />
              )}
              {index === breadcrumbs.length - 1 ? (
                <span className="text-text-primary truncate max-w-[200px]">
                  {crumb.label}
                </span>
              ) : (
                <button
                  onClick={() => navigate(crumb.path)}
                  className="text-text-secondary hover:text-text-primary transition-colors truncate max-w-[150px]"
                >
                  {crumb.label}
                </button>
              )}
            </span>
          ))}
        </nav>
      </div>

      {/* Right - Theme Toggle + User Menu */}
      <div className="flex items-center gap-3">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg bg-brand-dark/30 border border-brand-border text-text-primary hover:bg-brand-dark/50 transition-all"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-yellow-400" />
          ) : (
            <Moon className="w-4 h-4 text-brand" />
          )}
        </button>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-brand-dark/50 transition-colors"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-brand to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
              {getInitials(user?.email)}
            </div>
            <ChevronDown
              className={`w-4 h-4 text-text-secondary hidden sm:block transition-transform ${
                userMenuOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Dropdown */}
          {userMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setUserMenuOpen(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-56 bg-brand-light rounded-xl shadow-xl border border-brand-border py-1 z-20 overflow-hidden">
                {/* User Info */}
                <div className="px-4 py-3 border-b border-brand-border">
                  <p className="text-sm font-medium text-text-primary truncate">
                    {user?.email || "User"}
                  </p>
                  <p className="text-xs text-text-secondary mt-0.5">Logged in</p>
                </div>

                {/* Menu Items */}
                <div className="py-1">
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      navigate("/profile");
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:bg-brand-dark/30 hover:text-text-primary transition-colors"
                  >
                    <User className="w-4 h-4" />
                    Profile
                  </button>
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      navigate("/profile");
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:bg-brand-dark/30 hover:text-text-primary transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </button>
                </div>

                {/* Logout */}
                <div className="border-t border-brand-border py-1">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-rose-500 hover:bg-rose-500/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
