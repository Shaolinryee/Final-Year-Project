import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Users, 
  CheckSquare, 
  Square, 
  RefreshCw,
  Copy,
  Settings,
  Info,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { projectManagementApi } from '../services/adminApi';
import { toast } from 'react-toastify';

// Default permissions for each role based on existing permission system
const DEFAULT_PERMISSIONS = {
  owner: {
    canManageProject: true,
    canDeleteProject: true,
    canArchiveProject: true,
    canInviteMembers: true,
    canManageMembers: true,
    canChangeRoles: true,
    canCreateTask: true,
    canEditAnyTask: true,
    canDeleteTask: true,
    canAssignTasks: true,
    canAddComments: true,
    canAddAttachments: true,
    canViewActivity: true,
  },
  admin: {
    canManageProject: true,
    canDeleteProject: false,
    canArchiveProject: false,
    canInviteMembers: true,
    canManageMembers: true,
    canChangeRoles: true,
    canCreateTask: true,
    canEditAnyTask: true,
    canDeleteTask: true,
    canAssignTasks: true,
    canAddComments: true,
    canAddAttachments: true,
    canViewActivity: true,
  },
  member: {
    canManageProject: false,
    canDeleteProject: false,
    canArchiveProject: false,
    canInviteMembers: false,
    canManageMembers: false,
    canChangeRoles: false,
    canCreateTask: false,
    canEditAnyTask: false,
    canDeleteTask: false,
    canAssignTasks: true,
    canAddComments: true,
    canAddAttachments: true,
    canViewActivity: true,
  },
};

// Permission descriptions and categories
const PERMISSION_CATEGORIES = {
  project: {
    label: 'Project Management',
    description: 'Control project settings and lifecycle',
    icon: Settings,
    permissions: ['canManageProject', 'canDeleteProject', 'canArchiveProject']
  },
  members: {
    label: 'Team Management',
    description: 'Manage team members and their access',
    icon: Users,
    permissions: ['canInviteMembers', 'canManageMembers', 'canChangeRoles']
  },
  tasks: {
    label: 'Task Management',
    description: 'Create and manage project tasks',
    icon: CheckSquare,
    permissions: ['canCreateTask', 'canEditAnyTask', 'canDeleteTask', 'canAssignTasks']
  },
  content: {
    label: 'Content & Activity',
    description: 'View and interact with project content',
    icon: Info,
    permissions: ['canAddComments', 'canAddAttachments', 'canViewActivity']
  }
};

const PERMISSION_DESCRIPTIONS = {
  canManageProject: { label: 'Manage Project Settings', description: 'Edit project name, description, and key' },
  canDeleteProject: { label: 'Delete Project', description: 'Permanently delete the entire project' },
  canArchiveProject: { label: 'Archive Project', description: 'Archive or unarchive projects' },
  canInviteMembers: { label: 'Invite Members', description: 'Add new members to the project' },
  canManageMembers: { label: 'Manage Members', description: 'Remove members from the project' },
  canChangeRoles: { label: 'Change Roles', description: 'Modify member roles and permissions' },
  canCreateTask: { label: 'Create Tasks', description: 'Create new tasks in the project' },
  canEditAnyTask: { label: 'Edit Tasks', description: 'Edit any task in the project' },
  canDeleteTask: { label: 'Delete Tasks', description: 'Delete tasks from the project' },
  canAssignTasks: { label: 'Assign Tasks', description: 'Assign tasks to team members' },
  canAddComments: { label: 'Add Comments', description: 'Comment on tasks and project items' },
  canAddAttachments: { label: 'Add Attachments', description: 'Upload files to tasks and projects' },
  canViewActivity: { label: 'View Activity', description: 'View project activity and history' },
};

const ProjectPermissionManagement = () => {
  const [permissionMatrix, setPermissionMatrix] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({
    project: true,
    members: true,
    tasks: true,
    content: true
  });

  useEffect(() => {
    fetchSystemPermissions();
  }, []);

  const fetchSystemPermissions = async () => {
    try {
      setLoading(true);
      // Initialize permission matrix with defaults
      const initialMatrix = {};

      Object.entries(PERMISSION_CATEGORIES).forEach(([categoryKey, categoryData]) => {
        initialMatrix[categoryKey] = {};
        categoryData.permissions.forEach(permissionKey => {
          initialMatrix[categoryKey][permissionKey] = {
            ...PERMISSION_DESCRIPTIONS[permissionKey],
            overrides: {}
          };
        });
      });

      // Build permission matrix from defaults
      Object.entries(DEFAULT_PERMISSIONS).forEach(([role, permissions]) => {
        Object.entries(permissions).forEach(([permissionKey, defaultValue]) => {
          // Find which category this permission belongs to
          const categoryKey = Object.keys(PERMISSION_CATEGORIES).find(key => 
            PERMISSION_CATEGORIES[key].permissions.includes(permissionKey)
          );

          if (categoryKey && initialMatrix[categoryKey][permissionKey]) {
            initialMatrix[categoryKey][permissionKey].overrides[role] = {
              enabled: defaultValue,
              overridden: false
            };
          }
        });
      });

      setPermissionMatrix(initialMatrix);
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Error fetching system permissions:', error);
      toast.error('Failed to fetch system permissions');
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionToggle = (category, permissionKey, role) => {
    if (!permissionMatrix) return;

    const newMatrix = { ...permissionMatrix };
    const currentOverride = newMatrix[category][permissionKey].overrides[role];
    
    // Simple toggle: enabled -> disabled -> enabled
    const newValue = !currentOverride.enabled;

    newMatrix[category][permissionKey].overrides[role] = {
      ...currentOverride,
      enabled: newValue,
      overridden: true // Always overridden since we're manually setting it
    };

    setPermissionMatrix(newMatrix);
    setHasUnsavedChanges(true);
  };

  const handleCopyRolePermissions = (fromRole, toRole) => {
    if (!permissionMatrix) return;

    const newMatrix = { ...permissionMatrix };
    
    Object.entries(newMatrix).forEach(([category, categoryPermissions]) => {
      Object.entries(categoryPermissions).forEach(([permissionKey, permissionData]) => {
        const fromState = permissionData.overrides[fromRole];
        if (fromState) {
          newMatrix[category][permissionKey].overrides[toRole] = {
            enabled: fromState.enabled,
            overridden: true
          };
        }
      });
    });

    setPermissionMatrix(newMatrix);
    setHasUnsavedChanges(true);
    toast.success(`Copied ${fromRole} permissions to ${toRole}`);
  };

  const handleSavePermissions = async () => {
    if (!permissionMatrix) return;

    try {
      setSaving(true);
      
      // Build system permissions object for API
      const systemPermissions = {};
      const roles = ['owner', 'admin', 'member'];

      Object.entries(permissionMatrix).forEach(([category, categoryPermissions]) => {
        Object.entries(categoryPermissions).forEach(([permissionKey, permissionData]) => {
          roles.forEach(role => {
            const override = permissionData.overrides[role];
            if (!systemPermissions[role]) {
              systemPermissions[role] = {};
            }
            // Save the current enabled state
            systemPermissions[role][permissionKey] = override.enabled;
          });
        });
      });

      // TODO: Call system permissions API when created
      // await systemApi.updateSystemPermissions(systemPermissions);
      console.log('Saving system permissions:', systemPermissions);
      
      setHasUnsavedChanges(false);
      toast.success('System permissions updated successfully');
    } catch (error) {
      console.error('Error saving permissions:', error);
      toast.error('Failed to save permissions');
    } finally {
      setSaving(false);
    }
  };

  const handleResetPermissions = async () => {
    if (!window.confirm('Are you sure you want to reset all system permissions to defaults? This will clear all customizations.')) {
      return;
    }

    try {
      setSaving(true);
      
      // Reset all permissions to defaults
      const resetMatrix = { ...permissionMatrix };
      Object.entries(resetMatrix).forEach(([category, categoryPermissions]) => {
        Object.entries(categoryPermissions).forEach(([permissionKey, permissionData]) => {
          Object.keys(permissionData.overrides).forEach(role => {
            const defaultValue = DEFAULT_PERMISSIONS[role][permissionKey];
            resetMatrix[category][permissionKey].overrides[role] = {
              enabled: defaultValue,
              overridden: false
            };
          });
        });
      });

      setPermissionMatrix(resetMatrix);
      setHasUnsavedChanges(false);
      
      // TODO: Call system permissions API when created
      // await systemApi.resetSystemPermissions();
      
      toast.success('System permissions reset to defaults successfully');
    } catch (error) {
      console.error('Error resetting permissions:', error);
      toast.error('Failed to reset permissions');
    } finally {
      setSaving(false);
    }
  };

  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const getPermissionIcon = (enabled) => {
    return enabled ? 
      <CheckSquare className="w-4 h-4 text-green-600" /> : 
      <Square className="w-4 h-4 text-red-600" />;
  };

  const getPermissionStatus = (enabled) => {
    return enabled ? 'text-green-600' : 'text-red-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <div className="text-sm text-gray-600">Loading system permissions...</div>
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
            <div className="flex items-center space-x-3">
              <Shield className="w-6 h-6 text-blue-600" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">System Permissions</h1>
                <p className="text-sm text-gray-500">Manage role permissions across all projects</p>
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
              <button
                onClick={handleResetPermissions}
                disabled={saving}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reset to Defaults
              </button>
              <button
                onClick={handleSavePermissions}
                disabled={saving || !hasUnsavedChanges}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckSquare className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {permissionMatrix && (
          <div className="space-y-8">
            {Object.entries(permissionMatrix).map(([categoryKey, categoryData]) => (
              <div key={categoryKey} className="bg-white rounded-xl shadow-sm border border-gray-200">
                {/* Category Header */}
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {React.createElement(PERMISSION_CATEGORIES[categoryKey].icon, { className: "w-5 h-5 text-gray-600" })}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{PERMISSION_CATEGORIES[categoryKey].label}</h3>
                        <p className="text-sm text-gray-500 mt-1">{PERMISSION_CATEGORIES[categoryKey].description}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setExpandedCategories((prev) => ({ ...prev, [categoryKey]: !prev[categoryKey] }))}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {expandedCategories[categoryKey] ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Permission Grid */}
                {expandedCategories[categoryKey] && (
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {PERMISSION_CATEGORIES[categoryKey].permissions.map((permissionKey) => {
                        const permissionData = categoryData[permissionKey];
                        return (
                          <div key={permissionKey} className="border border-gray-200 rounded-lg p-4">
                            <div className="space-y-4">
                              {/* Permission Header */}
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h4 className="font-medium text-gray-900">{permissionData.label}</h4>
                                  <p className="text-sm text-gray-500 mt-1">{permissionData.description}</p>
                                </div>
                                <button
                                  onClick={() => handleCopyRolePermissions('owner', 'admin')}
                                  className="text-gray-400 hover:text-blue-600 transition-colors"
                                  title="Copy Owner permissions to Admin"
                                >
                                  <Copy className="w-4 h-4" />
                                </button>
                              </div>

                              {/* Role Toggles */}
                              <div className="grid grid-cols-3 gap-3">
                                {['owner', 'admin', 'member'].map((role) => (
                                  <div key={role} className="text-center">
                                    <div className="text-xs font-medium text-gray-700 mb-2 capitalize">{role}</div>
                                    <button
                                      onClick={() => handlePermissionToggle(categoryKey, permissionKey, role)}
                                      className={`w-full py-3 px-4 rounded-lg border-2 transition-all duration-200 font-medium text-sm ${
                                        permissionData.overrides[role].enabled
                                          ? 'border-green-500 bg-green-50 text-green-700 hover:bg-green-100'
                                          : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                                      }`}
                                    >
                                      <div className="flex items-center justify-center">
                                        {permissionData.overrides[role].enabled ? (
                                          <CheckSquare className="w-4 h-4 mr-2" />
                                        ) : (
                                          <Square className="w-4 h-4 mr-2" />
                                        )}
                                        <span>{permissionData.overrides[role].enabled ? 'Enabled' : 'Disabled'}</span>
                                      </div>
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Floating Save Indicator */}
        {hasUnsavedChanges && (
          <div className="fixed bottom-8 right-8 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg border border-blue-700 flex items-center space-x-2">
            <div className="w-2 h-2 bg-white rounded-full"></div>
            <span className="text-sm font-medium">You have unsaved changes</span>
            <button
              onClick={handleSavePermissions}
              disabled={saving}
              className="ml-4 px-3 py-1 bg-blue-700 hover:bg-blue-800 rounded-md text-sm font-medium transition-colors"
            >
              Save Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectPermissionManagement;
