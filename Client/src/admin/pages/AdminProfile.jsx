import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Shield, 
  Clock, 
  Camera, 
  Edit2, 
  Save, 
  X, 
  Key, 
  Smartphone, 
  LogOut,
  Settings,
  Globe,
  Bell,
  ArrowLeft,
  Activity,
  Lock,
  History
} from 'lucide-react';
import { profileApi } from '../services/adminApi';
import { toast } from 'react-toastify';
import ProfileInfoTab from '../components/profile/ProfileInfoTab';
import SecurityTab from '../components/profile/SecurityTab';
import SessionsTab from '../components/profile/SessionsTab';

const AdminProfile = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch profile data
  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const response = await profileApi.getProfile();
      if (response.data?.data) {
        setProfileData(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch profile data:', error);
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  const tabs = [
    {
      id: 'profile',
      label: 'Profile Information',
      icon: User,
      description: 'Manage your basic information and profile photo',
      color: 'blue'
    },
    {
      id: 'security',
      label: 'Security Settings',
      icon: Shield,
      description: 'Password, 2FA, and security preferences',
      color: 'green'
    },
    {
      id: 'sessions',
      label: 'Sessions & Activity',
      icon: Clock,
      description: 'Active sessions and login history',
      color: 'purple'
    }
  ];

  const getTabColor = (color) => {
    switch (color) {
      case 'blue': return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: 'text-blue-600' };
      case 'green': return { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', icon: 'text-green-600' };
      case 'purple': return { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', icon: 'text-purple-600' };
      default: return { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200', icon: 'text-gray-600' };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <div className="text-sm text-gray-600">Loading profile...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/admin')}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Admin Profile</h1>
                <p className="text-sm text-gray-500">Manage your account settings and preferences</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">
                  {profileData?.admin?.role || 'Administrator'}
                </div>
                <div className="text-xs text-gray-500">
                  {profileData?.admin?.email || 'admin@collabspace.com'}
                </div>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold shadow-lg">
                {profileData?.admin?.avatar ? (
                  <img 
                    src={`http://localhost:5000${profileData.admin.avatar}`} 
                    alt={profileData.admin.name} 
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  profileData?.admin?.name?.charAt(0).toUpperCase() || 'A'
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* Profile Summary Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="text-center">
                  <div className="relative inline-block mb-4">
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto overflow-hidden shadow-lg">
                      {profileData?.admin?.avatar ? (
                        <img 
                          src={`http://localhost:5000${profileData.admin.avatar}`} 
                          alt={profileData.admin.name} 
                          className="w-24 h-24 rounded-full object-cover"
                        />
                      ) : (
                        profileData?.admin?.name?.charAt(0).toUpperCase() || 'A'
                      )}
                    </div>
                    <button className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors shadow-lg">
                      <Camera className="w-4 h-4" />
                    </button>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    {profileData?.admin?.name || 'Admin'}
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    {profileData?.admin?.email || 'admin@collabspace.com'}
                  </p>
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {profileData?.admin?.role || 'Administrator'}
                  </div>
                </div>
              </div>

              {/* Admin Stats Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Administrator Statistics</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <User className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Total Users</p>
                        <p className="text-xs text-gray-500">System wide</p>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-blue-900">
                      {profileData?.stats?.totalUsers || 0}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <Activity className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Active Users</p>
                        <p className="text-xs text-gray-500">Last 30 days</p>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-green-900">
                      {profileData?.stats?.activeUsers || 0}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                        <History className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Total Logins</p>
                        <p className="text-xs text-gray-500">All time</p>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-purple-900">
                      {profileData?.stats?.loginCount || 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Settings</h3>
                <nav className="space-y-2">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const colors = getTabColor(tab.color);
                    const isActive = activeTab === tab.id;
                    
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                          isActive
                            ? `${colors.bg} ${colors.text} border-l-4 ${colors.border}`
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          isActive ? `${colors.bg}` : 'bg-gray-100'
                        }`}>
                          <Icon className={`w-4 h-4 ${isActive ? colors.icon : 'text-gray-600'}`} />
                        </div>
                        <div className="text-left flex-1">
                          <div className="text-sm font-medium">{tab.label}</div>
                          <div className="text-xs text-gray-500">{tab.description}</div>
                        </div>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              {/* Tab Header */}
              <div className="border-b border-gray-200 px-6 py-6">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    getTabColor(tabs.find(t => t.id === activeTab)?.color || 'blue').bg
                  }`}>
                    {(() => {
                      const ActiveIcon = tabs.find(t => t.id === activeTab)?.icon || User;
                      const colors = getTabColor(tabs.find(t => t.id === activeTab)?.color || 'blue');
                      return <ActiveIcon className={`w-6 h-6 ${colors.icon}`} />;
                    })()}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {tabs.find(t => t.id === activeTab)?.label || 'Profile'}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {tabs.find(t => t.id === activeTab)?.description || 'Manage your settings'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'profile' && (
                  <ProfileInfoTab 
                    profileData={profileData} 
                    onProfileUpdate={fetchProfileData}
                  />
                )}
                {activeTab === 'security' && (
                  <SecurityTab 
                    profileData={profileData} 
                    onProfileUpdate={fetchProfileData}
                  />
                )}
                {activeTab === 'sessions' && (
                  <SessionsTab 
                    profileData={profileData} 
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
