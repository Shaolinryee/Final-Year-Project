/**
 * Sidebar Component
 * Jira-like collapsible sidebar with main navigation and project-specific links
 */

import { NavLink, useParams, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  FolderKanban,
  ListTodo,
  Activity,
  Mail,
  User,
  ChevronLeft,
  ChevronRight,
  Home,
  Users,
  Settings,
  BarChart3,
} from "lucide-react";

const Sidebar = ({ collapsed, onToggle }) => {
  const { projectId } = useParams();
  const location = useLocation();
  
  // Check if we're in a project context
  const isInProject = location.pathname.startsWith("/projects/") && projectId;

  const mainNavItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Projects", path: "/projects", icon: FolderKanban, exact: true },
    { name: "My Tasks", path: "/my-tasks", icon: ListTodo },
    { name: "Activity", path: "/activity", icon: Activity },
    { name: "Invitations", path: "/invitations", icon: Mail },
    { name: "Profile", path: "/profile", icon: User },
  ];

  const projectNavItems = projectId ? [
    { name: "Overview", path: `/projects/${projectId}/overview`, icon: Home },
    { name: "Tasks", path: `/projects/${projectId}/tasks`, icon: ListTodo },
    { name: "Members", path: `/projects/${projectId}/members`, icon: Users },
    { name: "Activity", path: `/projects/${projectId}/activity`, icon: BarChart3 },
    { name: "Settings", path: `/projects/${projectId}/settings`, icon: Settings },
  ] : [];

  const NavItem = ({ item, showLabel = true }) => (
    <NavLink
      to={item.path}
      end={item.exact}
      className={({ isActive }) =>
        `group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
          isActive
            ? "bg-brand/10 text-text-primary border-l-2 border-brand -ml-[2px] pl-[14px]"
            : "text-text-secondary hover:bg-brand-light/50 hover:text-text-primary"
        } ${collapsed ? "justify-center px-2" : ""}`
      }
      title={collapsed ? item.name : undefined}
    >
      <item.icon className={`w-5 h-5 flex-shrink-0 ${collapsed ? "" : ""}`} />
      {showLabel && !collapsed && (
        <span className="truncate">{item.name}</span>
      )}
    </NavLink>
  );

  return (
    <aside
      className={`${
        collapsed ? "w-16" : "w-64"
      } h-screen bg-brand-light border-r border-brand-border flex flex-col transition-all duration-300 ease-in-out`}
    >
      {/* Logo */}
      <div className={`h-16 flex items-center border-b border-brand-border ${collapsed ? "justify-center px-2" : "px-4"}`}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-brand to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <FolderKanban className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <span className="font-bold text-lg text-text-primary tracking-tight">
              CollabWeb
            </span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {/* Main Navigation */}
        <div>
          {!collapsed && (
            <h3 className="px-3 mb-2 text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Main
            </h3>
          )}
          <div className="space-y-1">
            {mainNavItems.map((item) => (
              <NavItem key={item.path} item={item} />
            ))}
          </div>
        </div>

        {/* Project Navigation - Only show when in project context */}
        {isInProject && projectNavItems.length > 0 && (
          <div>
            {!collapsed && (
              <h3 className="px-3 mb-2 text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Project
              </h3>
            )}
            {collapsed && <div className="border-t border-brand-border my-2" />}
            <div className="space-y-1">
              {projectNavItems.map((item) => (
                <NavItem key={item.path} item={item} />
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Collapse Toggle */}
      <div className="border-t border-brand-border p-3">
        <button
          onClick={onToggle}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-text-secondary hover:bg-brand-light/50 hover:text-text-primary transition-colors ${
            collapsed ? "justify-center px-2" : ""
          }`}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
