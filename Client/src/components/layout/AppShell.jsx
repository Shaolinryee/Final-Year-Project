/**
 * AppShell Component
 * Jira-like layout with collapsible sidebar and topbar
 */

import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const AppShell = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const toggleMobileSidebar = () => {
    setMobileSidebarOpen(!mobileSidebarOpen);
  };

  return (
    <div className="h-screen flex bg-brand-dark overflow-hidden transition-colors duration-300">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex h-screen flex-shrink-0">
        <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={toggleMobileSidebar}
          />
          <div className="fixed inset-y-0 left-0 z-50 lg:hidden h-screen">
            <Sidebar collapsed={false} onToggle={toggleMobileSidebar} />
          </div>
        </>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen">
        <Topbar onToggleSidebar={toggleMobileSidebar} />
        
        <main className="flex-1 overflow-y-auto bg-brand-dark transition-colors duration-300">
          <div className="w-full max-w-[1600px] px-6 lg:px-8 py-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppShell;
