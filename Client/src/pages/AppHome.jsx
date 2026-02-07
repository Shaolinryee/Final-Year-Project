/**
 * AppHome Component
 * Redirects to dashboard or shows quick welcome screen
 */

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LayoutDashboard, FolderKanban, ListTodo, ArrowRight } from "lucide-react";
import { Button } from "../components/ui";

const AppHome = () => {
  const navigate = useNavigate();

  // Auto-redirect to dashboard after a brief moment
  useEffect(() => {
    const timer = setTimeout(() => navigate("/dashboard"), 3000);
    return () => clearTimeout(timer);
  }, [navigate]);

  const quickLinks = [
    {
      title: "Dashboard",
      description: "View your overview and stats",
      icon: LayoutDashboard,
      path: "/dashboard",
      color: "bg-blue-500",
    },
    {
      title: "Projects",
      description: "Manage your projects",
      icon: FolderKanban,
      path: "/projects",
      color: "bg-emerald-500",
    },
    {
      title: "My Tasks",
      description: "View assigned tasks",
      icon: ListTodo,
      path: "/my-tasks",
      color: "bg-purple-500",
    },
  ];

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4">
      {/* Welcome Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome to CollabSpace
        </h1>
        <p className="text-gray-500 dark:text-gray-400 max-w-md">
          Your workspace for managing projects and tasks. Where would you like to go?
        </p>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl w-full mb-8">
        {quickLinks.map((link) => (
          <button
            key={link.path}
            onClick={() => navigate(link.path)}
            className="group p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-lg transition-all text-left"
          >
            <div
              className={`w-12 h-12 ${link.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
            >
              <link.icon className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
              {link.title}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {link.description}
            </p>
          </button>
        ))}
      </div>

      {/* Primary CTA */}
      <Button
        onClick={() => navigate("/dashboard")}
        rightIcon={<ArrowRight size={18} />}
        size="lg"
      >
        Go to Dashboard
      </Button>
    </div>
  );
};

export default AppHome;
