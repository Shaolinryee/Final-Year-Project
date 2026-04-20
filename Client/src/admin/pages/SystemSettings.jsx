import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Save, 
  RotateCcw, 
  Shield, 
  Bell, 
  Mail, 
  Database, 
  Key, 
  Globe, 
  Clock, 
  UserCheck, 
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Check,
  X,
  Download,
  Upload,
  Search
} from 'lucide-react';
import { toast } from 'react-toastify';
import settingsApi from '../services/settingsApi';

const SystemSettings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [showResetModal, setShowResetModal] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    integration: true,
    security: true,
    notifications: true,
    backup: true,
    performance: true
  });

  // Settings categories with icons and descriptions
  const categories = [
    {
      id: 'general',
      name: 'General',
      icon: Settings,
      description: 'Basic system configuration'
    },
    {
      id: 'users',
      name: 'User Management',
      icon: UserCheck,
      description: 'User registration and authentication policies'
    },
    {
      id: 'security',
      name: 'Security',
      icon: Shield,
      description: 'Security and authentication settings'
    },
    {
      id: 'email',
      name: 'Email',
      icon: Mail,
      description: 'Email server and notification settings'
    },
    {
      id: 'notifications',
      name: 'Notifications',
      icon: Bell,
      description: 'System notification preferences'
    },
    {
      id: 'backup',
      name: 'Backup',
      icon: Database,
      description: 'Data backup and recovery settings'
    },
    {
      id: 'performance',
      name: 'Performance',
      icon: Clock,
      description: 'System performance and caching'
    },
    {
      id: 'integration',
      name: 'Integration',
      icon: Key,
      description: 'Third-party service integrations'
    }
  ];  

  // Settings definitions for each category
  const settingsDefinitions = {
    general: [
      { key: 'systemName', label: 'System Name', type: 'string', default: 'Task Management System' },
      { key: 'systemDescription', label: 'System Description', type: 'text', default: 'A comprehensive task management platform' },
      { key: 'adminEmail', label: 'Admin Email', type: 'email', default: 'admin@example.com' },
      { key: 'timezone', label: 'Timezone', type: 'select', options: ['UTC', 'America/New_York', 'Europe/London'], default: 'UTC' },
      { key: 'dateFormat', label: 'Date Format', type: 'select', options: ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'], default: 'MM/DD/YYYY' },
      { key: 'maintenanceMode', label: 'Maintenance Mode', type: 'boolean', default: false }
    ],
    users: [
      { key: 'defaultUserRole', label: 'Default User Role', type: 'select', options: ['user', 'admin'], default: 'user' },
      { key: 'registrationEnabled', label: 'Allow User Registration', type: 'boolean', default: true },
      { key: 'emailVerificationRequired', label: 'Require Email Verification', type: 'boolean', default: true },
      { key: 'passwordMinLength', label: 'Minimum Password Length', type: 'number', default: 8 },
      { key: 'sessionTimeout', label: 'Session Timeout (minutes)', type: 'number', default: 120 },
      { key: 'maxLoginAttempts', label: 'Max Login Attempts', type: 'number', default: 5 }
    ],
    security: [
      { key: 'twoFactorEnabled', label: 'Two-Factor Authentication', type: 'boolean', default: false },
      { key: 'sessionSecure', label: 'Secure Session Cookies', type: 'boolean', default: true },
      { key: 'apiRateLimit', label: 'API Rate Limit (requests/minute)', type: 'number', default: 100 },
      { key: 'ipWhitelist', label: 'IP Whitelist', type: 'text', default: '' },
      { key: 'auditLogRetention', label: 'Audit Log Retention (days)', type: 'number', default: 90 },
      { key: 'passwordComplexity', label: 'Password Complexity Required', type: 'boolean', default: true }
    ],
    email: [
      { key: 'smtpServer', label: 'SMTP Server', type: 'text', default: 'smtp.gmail.com' },
      { key: 'smtpPort', label: 'SMTP Port', type: 'number', default: 587 },
      { key: 'smtpUsername', label: 'SMTP Username', type: 'text', default: '' },
      { key: 'smtpPassword', label: 'SMTP Password', type: 'password', default: '' },
      { key: 'fromEmail', label: 'From Email Address', type: 'email', default: 'noreply@taskmanagement.com' },
      { key: 'emailTemplates', label: 'Email Templates', type: 'json', default: '{}' }
    ],
    notifications: [
      { key: 'emailNotificationsEnabled', label: 'Email Notifications', type: 'boolean', default: true },
      { key: 'systemNotificationsEnabled', label: 'System Notifications', type: 'boolean', default: true },
      { key: 'notificationTypes', label: 'Notification Types', type: 'array', default: '["user_registration", "system_alerts", "security_events"]' },
      { key: 'notificationFrequency', label: 'Notification Frequency', type: 'select', options: ['immediate', 'daily', 'weekly'], default: 'immediate' },
      { key: 'adminNotifications', label: 'Admin Notifications', type: 'boolean', default: true }
    ],
    backup: [
      { key: 'autoBackup', label: 'Automatic Backup', type: 'boolean', default: true },
      { key: 'backupFrequency', label: 'Backup Frequency', type: 'select', options: ['daily', 'weekly', 'monthly'], default: 'daily' },
      { key: 'backupRetention', label: 'Backup Retention (days)', type: 'number', default: 30 },
      { key: 'backupLocation', label: 'Backup Location', type: 'text', default: '/backups' },
      { key: 'backupEncryption', label: 'Backup Encryption', type: 'boolean', default: true }
    ],
    performance: [
      { key: 'cacheEnabled', label: 'Enable Caching', type: 'boolean', default: true },
      { key: 'cacheTTL', label: 'Cache TTL (seconds)', type: 'number', default: 3600 },
      { key: 'maxFileUploadSize', label: 'Max File Upload Size (MB)', type: 'number', default: 10 },
      { key: 'concurrentUsers', label: 'Max Concurrent Users', type: 'number', default: 100 },
      { key: 'dbConnectionPool', label: 'Database Connection Pool', type: 'number', default: 10 }
    ],
    integration: [
      { key: 'apiKeys', label: 'API Keys', type: 'json', default: '{}' },
      { key: 'webhookUrls', label: 'Webhook URLs', type: 'json', default: '{}' },
      { key: 'thirdPartyServices', label: 'Third-party Services', type: 'json', default: '{}' },
      { key: 'ssoEnabled', label: 'Single Sign-On', type: 'boolean', default: false },
      { key: 'ldapConfiguration', label: 'LDAP Configuration', type: 'json', default: '{}' }
    ]
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await settingsApi.getSystemSettings();
      if (response.success) {
        setSettings(response.data);
      } else {
        toast.error('Failed to load system settings');
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Error loading system settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = async (key, value, type) => {
    try {
      setSaving(prev => ({ ...prev, [key]: true }));
      
      // Convert value based on type
      let convertedValue = value;
      if (type === 'boolean') {
        convertedValue = value === 'true' || value === true;
      } else if (type === 'number') {
        convertedValue = parseFloat(value);
      } else if (type === 'json') {
        convertedValue = JSON.stringify(value);
      }

      const response = await settingsApi.updateSystemSetting(key, convertedValue, type);
      if (response.success) {
        setSettings(prev => ({ ...prev, [key]: convertedValue }));
        setHasUnsavedChanges(true);
        toast.success('Setting updated successfully');
      } else {
        toast.error(response.message || 'Failed to update setting');
      }
    } catch (error) {
      console.error('Error updating setting:', error);
      toast.error('Error updating setting');
    } finally {
      setSaving(prev => ({ ...prev, [key]: false }));
    }
  };

  const handleResetSettings = async () => {
    try {
      setLoading(true);
      const response = await settingsApi.resetSystemSettings();
      if (response.success) {
        await fetchSettings();
        setHasUnsavedChanges(false);
        toast.success('Settings reset to defaults');
        setShowResetModal(false);
      } else {
        toast.error(response.message || 'Failed to reset settings');
      }
    } catch (error) {
      console.error('Error resetting settings:', error);
      toast.error('Error resetting settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAllChanges = async () => {
    try {
      setSaving({ all: true });
      const response = await settingsApi.saveAllSettings(settings);
      if (response.success) {
        setHasUnsavedChanges(false);
        toast.success('All settings saved successfully');
      } else {
        toast.error(response.message || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Error saving settings');
    } finally {
      setSaving({ all: false });
    }
  };

  const handleExportSettings = async () => {
    try {
      const response = await settingsApi.exportSettings();
      if (response.success) {
        const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'system-settings.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        toast.success('Settings exported successfully');
      }
    } catch (error) {
      console.error('Error exporting settings:', error);
      toast.error('Error exporting settings');
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const groupSettingsByCategory = (tabSettings) => {
    const groups = {};
    tabSettings.forEach(setting => {
      const category = getCategoryForSetting(setting.key);
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(setting);
    });
    return groups;
  };

  const getCategoryForSetting = (key) => {
    if (key.includes('smtp') || key.includes('email')) return 'email';
    if (key.includes('api') || key.includes('webhook') || key.includes('sso') || key.includes('ldap')) return 'integration';
    if (key.includes('password') || key.includes('session') || key.includes('audit') || key.includes('rateLimit')) return 'security';
    if (key.includes('notification') || key.includes('alert')) return 'notifications';
    if (key.includes('backup') || key.includes('retention')) return 'backup';
    if (key.includes('cache') || key.includes('performance') || key.includes('upload')) return 'performance';
    return 'general';
  };

  const filteredSettings = settingsDefinitions[activeTab]?.filter(setting => 
    setting.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
    setting.label.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const renderSettingInput = (setting) => {
    const currentValue = settings[setting.key] ?? setting.default;
    
    switch (setting.type) {
      case 'boolean':
        return (
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <div>
                <label className="text-sm font-medium text-gray-900">{setting.label}</label>
                <p className="text-xs text-gray-500 mt-1">Toggle this setting to enable or disable</p>
              </div>
            </div>
            <button
              onClick={() => handleSettingChange(setting.key, !currentValue, setting.type)}
              disabled={saving[setting.key]}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                currentValue ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-300 hover:bg-gray-400'
              } ${saving[setting.key] ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                currentValue ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
        );
      
      case 'select':
        return (
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <label className="block text-sm font-medium text-gray-900 mb-2">{setting.label}</label>
            <select
              value={currentValue}
              onChange={(e) => handleSettingChange(setting.key, e.target.value, setting.type)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              disabled={saving[setting.key]}
            >
              {setting.options?.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        );
      
      case 'text':
      case 'email':
        return (
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <label className="block text-sm font-medium text-gray-900 mb-2">{setting.label}</label>
            <input
              type={setting.type}
              value={currentValue}
              onChange={(e) => handleSettingChange(setting.key, e.target.value, setting.type)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              placeholder={`Enter ${setting.label.toLowerCase()}`}
              disabled={saving[setting.key]}
            />
          </div>
        );
      
      case 'password':
        return (
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <label className="block text-sm font-medium text-gray-900 mb-2">{setting.label}</label>
            <input
              type="password"
              value={currentValue}
              onChange={(e) => handleSettingChange(setting.key, e.target.value, setting.type)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              placeholder={`Enter ${setting.label.toLowerCase()}`}
              disabled={saving[setting.key]}
            />
          </div>
        );
      
      case 'number':
        return (
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <label className="block text-sm font-medium text-gray-900 mb-2">{setting.label}</label>
            <input
              type="number"
              value={currentValue}
              onChange={(e) => handleSettingChange(setting.key, e.target.value, setting.type)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              disabled={saving[setting.key]}
            />
          </div>
        );
      
      case 'json':
        return (
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <label className="block text-sm font-medium text-gray-900 mb-2">{setting.label}</label>
            <div className="relative">
              <textarea
                value={typeof currentValue === 'string' ? currentValue : JSON.stringify(currentValue, null, 2)}
                onChange={(e) => handleSettingChange(setting.key, e.target.value, setting.type)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white font-mono text-sm"
                rows={4}
                placeholder={`Enter ${setting.label.toLowerCase()} in JSON format`}
                disabled={saving[setting.key]}
              />
              {saving[setting.key] && (
                <div className="absolute top-2 right-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                </div>
              )}
            </div>
          </div>
        );
      
      case 'array':
        return (
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <label className="block text-sm font-medium text-gray-900 mb-2">{setting.label}</label>
            <div className="space-y-2">
              {Array.isArray(currentValue) ? currentValue.map((item, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm">{item}</span>
                </div>
              )) : (
                <p className="text-sm text-gray-500">No items configured</p>
              )}
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  const renderSectionCard = (categoryName, categorySettings, categoryInfo) => {
    const isExpanded = expandedSections[categoryName] || false;
    
    return (
      <div key={categoryName} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Section Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {categoryInfo.icon && <categoryInfo.icon className="w-5 h-5 text-gray-600" />}
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{categoryInfo.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{categoryInfo.description}</p>
              </div>
            </div>
            <button
              onClick={() => toggleSection(categoryName)}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            >
              {isExpanded ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Section Content */}
        {isExpanded && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categorySettings.map((setting) => (
                <div key={setting.key} className="relative">
                  {renderSettingInput(setting)}
                </div>
              ))}
            </div>
            
            {categorySettings.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Settings className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p>No settings available in this category</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <div className="text-sm text-gray-600">Loading system settings...</div>
        </div>
      </div>
    );
  }

  const categoryInfo = {
    general: { title: 'General Settings', description: 'Basic system configuration', icon: Settings },
    security: { title: 'Security Settings', description: 'Authentication and security policies', icon: Shield },
    email: { title: 'Email Configuration', description: 'SMTP and email notification settings', icon: Mail },
    notifications: { title: 'Notification Settings', description: 'System notification preferences', icon: Bell },
    backup: { title: 'Backup Settings', description: 'Data backup and recovery configuration', icon: Database },
    performance: { title: 'Performance Settings', description: 'System performance and caching', icon: Clock },
    integration: { title: 'Integration Settings', description: 'Third-party service integrations', icon: Key },
    users: { title: 'User Management', description: 'User registration and authentication policies', icon: UserCheck }
  };

  const groupedSettings = groupSettingsByCategory(filteredSettings);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Settings className="w-6 h-6 text-blue-600" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">System Settings</h1>
                <p className="text-sm text-gray-500">Configure system-wide settings and preferences</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-3">
              {hasUnsavedChanges && (
                <div className="text-sm text-amber-600 flex items-center">
                  <div className="w-2 h-2 bg-amber-600 rounded-full mr-2"></div>
                  Unsaved changes
                </div>
              )}
              
              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search settings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
              
              <button
                onClick={handleExportSettings}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
              
              <button
                onClick={handleSaveAllChanges}
                disabled={saving.all || !hasUnsavedChanges}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                {saving.all ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </button>
              
              <button
                onClick={() => setShowResetModal(true)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset to Defaults
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Category Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveTab(category.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === category.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <category.icon className="w-5 h-5" />
                <span className="font-medium">{category.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Results */}
        {searchTerm && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <Search className="w-5 h-5 text-blue-600" />
              <p className="text-sm text-blue-800">
                Found {filteredSettings.length} settings matching "{searchTerm}"
              </p>
            </div>
          </div>
        )}

        {/* Settings Sections */}
        <div className="space-y-8">
          {Object.entries(groupedSettings).map(([categoryName, categorySettings]) => {
            const info = categoryInfo[categoryName] || { title: categoryName, description: '', icon: Settings };
            return renderSectionCard(categoryName, categorySettings, info);
          })}
        </div>

        {filteredSettings.length === 0 && (
          <div className="text-center py-12">
            <Settings className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No settings found</h3>
            <p className="text-gray-500">
              {searchTerm ? 'Try adjusting your search terms' : 'No settings available in this category'}
            </p>
          </div>
        )}
      </div>

      {/* Reset Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-3xl border border-gray-200 max-w-md mx-4 p-6 backdrop-blur-sm">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Reset All Settings?</h3>
                <p className="text-sm text-gray-600 mb-4">
                  This will reset all system settings to their default values. This action cannot be undone.
                </p>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowResetModal(false)}
                className="px-4 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleResetSettings}
                className="px-4 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium text-white bg-red-600 hover:bg-red-700"
              >
                Reset Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Save Indicator */}
      {hasUnsavedChanges && (
        <div className="fixed bottom-8 right-8 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg border border-blue-700 flex items-center space-x-2">
          <div className="w-2 h-2 bg-white rounded-full"></div>
          <span className="text-sm font-medium">You have unsaved changes</span>
          <button
            onClick={handleSaveAllChanges}
            disabled={saving.all}
            className="ml-4 px-3 py-1 bg-blue-700 hover:bg-blue-800 rounded-md text-sm font-medium transition-colors"
          >
            Save Now
          </button>
        </div>
      )}
    </div>
  );
};

export default SystemSettings;
