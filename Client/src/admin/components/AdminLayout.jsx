import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import NavbarNotifications from './NavbarNotifications';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  FolderOpen, 
  Settings, 
  FileText, 
  Bell, 
  HardDrive,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Shield
} from 'lucide-react';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const menuItems = [
    {
      title: 'Dashboard',
      icon: LayoutDashboard,
      path: '/admin/dashboard',
      permissions: []
    },
    {
      title: 'User Management',
      icon: Users,
      path: '/admin/users',
      permissions: ['users:read']
    },
    {
      title: 'System Permissions',
      icon: Shield,
      path: '/admin/permissions',
      permissions: ['projects:read']
    },
        {
      title: 'System Settings',
      icon: Settings,
      path: '/admin/settings',
      permissions: ['system:manage_settings']
    },
    {
      title: 'Activity Logs',
      icon: FileText,
      path: '/admin/logs',
      permissions: ['admin:view_audit_logs']
    },
    {
      title: 'Notifications',
      icon: Bell,
      path: '/admin/notifications',
      permissions: ['system:manage_settings']
    },
    {
      title: 'Storage Management',
      icon: HardDrive,
      path: '/admin/storage',
      permissions: ['system:manage_storage']
    }
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const isActivePath = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - Fixed Position */}
      <div className={`fixed left-0 top-0 h-screen bg-gray-900 text-white transition-all duration-300 flex flex-col z-50 ${
        sidebarOpen ? 'w-64' : 'w-20'
      }`}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-800 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h1 className={`font-bold text-xl ${!sidebarOpen && 'hidden'}`}>
              Admin Dashboard
            </h1>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Navigation Menu - Scrollable */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = isActivePath(item.path);
              
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center p-3 rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm transform scale-105'
                        : 'hover:bg-gray-800 text-gray-300 hover:translate-x-1'
                    }`}
                  >
                    <Icon size={20} />
                    {sidebarOpen && (
                      <span className="ml-3 font-medium">{item.title}</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-800 flex-shrink-0">
          <Link
            to="/dashboard"
            className="flex items-center p-3 rounded-lg hover:bg-gray-800 transition-colors text-gray-300"
          >
            <LayoutDashboard size={20} />
            {sidebarOpen && (
              <span className="ml-3">Back to App</span>
            )}
          </Link>
        </div>
      </div>

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${
        sidebarOpen ? 'ml-64' : 'ml-20'
      } relative z-10`}>
        {/* Top Navigation */}
        <header className="bg-white shadow-sm border-b border-gray-200 flex-shrink-0 sticky top-0 z-20">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                {/* Logo - matching client panel design */}
                <div className="w-8 h-8 bg-blue-600 rounded-xl transform rotate-45 flex items-center justify-center shadow-lg shadow-blue-600/20">
                  <div className="w-4 h-4 bg-white rounded-full"></div>
                </div>

                <div>
                  <h1 className="text-xl font-black text-gray-900 uppercase tracking-tight">
                    CollabSpace
                  </h1>
                  <p className="text-xs text-gray-500">Admin Panel</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <NavbarNotifications />
              
              {/* User Menu */}
              <div className="relative z-30">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold overflow-hidden">
                    {user?.avatar ? (
                      <img 
                        src={`http://localhost:5000${user.avatar}`} 
                        alt={user.name} 
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      user?.name?.charAt(0).toUpperCase() || 'A'
                    )}
                  </div>
                  <ChevronDown size={16} />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-30">
                    <Link
                      to="/admin/profile"
                      className="block px-4 py-2 hover:bg-gray-100 transition-colors"
                    >
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors flex items-center space-x-2"
                    >
                      <LogOut size={16} />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content - Scrollable */}
        <main className="flex-1 overflow-y-auto p-6 relative pt-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
