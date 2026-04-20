import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Shield, 
  Ban, 
  CheckCircle,
  User as UserIcon,
  Mail,
  Calendar,
  Settings,
  AlertTriangle,
  X,
  ChevronDown,
  RefreshCw,
  ExternalLink,
  Edit,
  UserCheck,
  Power
} from 'lucide-react';
import { userManagementApi } from '../services/adminApi';
import { toast } from 'react-toastify';
import ImpersonationModal from '../../components/ImpersonationModal';
import { useAuth } from '../../context/AuthContext';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [actionLoading, setActionLoading] = useState({});
    const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedUserForRole, setSelectedUserForRole] = useState(null);
  const [availableRoles, setAvailableRoles] = useState([]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [showImpersonationModal, setShowImpersonationModal] = useState(false);
  const [selectedUserForImpersonation, setSelectedUserForImpersonation] = useState(null);
  const [impersonationLoading, setImpersonationLoading] = useState(false);
  
  const { user: adminUser } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, [currentPage, searchTerm]);

  
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userManagementApi.getUsers({
        page: currentPage,
        limit: 10,
        search: searchTerm
      });
      
      setUsers(response.data.data.users);
      setTotalPages(response.data.data.pagination.totalPages);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const toggleUserSelection = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const toggleUserStatus = async (userId) => {
    try {
      setActionLoading(prev => ({ ...prev, [userId]: true }));
      
      const response = await userManagementApi.toggleUserStatus(userId);
      
      // Update local state optimistically
      setUsers(prev => prev.map(user => 
        user.id === userId 
          ? { ...user, isActive: !user.isActive, suspendedAt: user.isActive ? new Date().toISOString() : null }
          : user
      ));
      
      toast.success(response.data.message);
      setOpenDropdown(null);
    } catch (error) {
      console.error('Error toggling user status:', error);
      toast.error(error.response?.data?.message || 'Failed to update user status');
    } finally {
      setActionLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  const handleRoleChange = (user) => {
    setSelectedUserForRole(user);
    setShowRoleModal(true);
    fetchAvailableRoles();
  };

  const fetchAvailableRoles = async () => {
    try {
      // For now, use basic roles. In future, fetch from API
      const roles = [
        { id: 'user', name: 'user', displayName: 'User' },
        { id: 'admin', name: 'admin', displayName: 'Administrator' }
      ];
      setAvailableRoles(roles);
    } catch (error) {
      console.error('Error fetching roles:', error);
      toast.error('Failed to load available roles');
    }
  };

  const handleRoleUpdate = async (newRole) => {
    if (!selectedUserForRole) return;
    
    try {
      setActionLoading(prev => ({ ...prev, [selectedUserForRole.id]: true }));
      
      await userManagementApi.assignRole(selectedUserForRole.id, newRole);
      
      // Update local state
      setUsers(prev => prev.map(user => 
        user.id === selectedUserForRole.id 
          ? { ...user, role: newRole }
          : user
      ));
      
      toast.success(`Role changed to ${newRole} successfully`);
      setShowRoleModal(false);
      setSelectedUserForRole(null);
    } catch (error) {
      console.error('Error changing role:', error);
      toast.error(error.response?.data?.message || 'Failed to change role');
    } finally {
      setActionLoading(prev => ({ ...prev, [selectedUserForRole.id]: false }));
    }
  };

  // Improved action handlers
  const handleOpenImpersonationModal = (user) => {
    setSelectedUserForImpersonation(user);
    setShowImpersonationModal(true);
  };

  const handleCloseImpersonationModal = () => {
    setSelectedUserForImpersonation(null);
    setShowImpersonationModal(false);
  };

  const handleImpersonateUser = async (userId, reason) => {
    try {
      setImpersonationLoading(true);
      
      const { impersonateUser } = useAuth();
      const result = await impersonateUser(userId, reason);
      
      if (result.success) {
        toast.success(`Successfully impersonating ${selectedUserForImpersonation.name}`);
        // Redirect to user dashboard after a short delay
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1000);
      } else {
        toast.error(result.error || 'Failed to impersonate user');
      }
    } catch (error) {
      console.error('Error impersonating user:', error);
      toast.error(error.message || 'Failed to impersonate user');
    } finally {
      setImpersonationLoading(false);
    }
  };

  
  
  const formatDate = (dateString) => {
    if (!dateString) {
      return (
        <span className="text-gray-400">
          Never
        </span>
      );
    }
    return new Date(dateString).toLocaleDateString();
  };

  // Simple status toggle without modal
  const handleStatusToggle = async (userId) => {
    try {
      setActionLoading(prev => ({ ...prev, [userId]: true }));
      
      await userManagementApi.toggleUserStatus(userId);
      
      setUsers(prev => prev.map(user => 
        user.id === userId 
          ? { ...user, isActive: !user.isActive }
          : user
      ));
      
      toast.success(`User ${users.find(u => u.id === userId)?.isActive ? 'disabled' : 'enabled'} successfully`);
    } catch (error) {
      console.error('Error toggling user status:', error);
      toast.error(error.response?.data?.message || 'Failed to update user status');
    } finally {
      setActionLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  const getRoleBadge = (user) => {
    // Handle role display logic for both role systems
    let roleConfig = { color: 'gray', label: 'User' };
    
    // Priority 1: Check for specific admin role (most specific)
    if (user.adminRole) {
      const adminRoleConfig = {
        super_admin: { color: 'purple', label: 'Super Admin' },
        admin: { color: 'blue', label: 'System Admin' },
        support: { color: 'green', label: 'Support' },
        read_only: { color: 'gray', label: 'Read Only' }
      };
      roleConfig = adminRoleConfig[user.adminRole.name] || { color: 'gray', label: user.adminRole.displayName || user.adminRole.name };
    }
    // Priority 2: Check for basic admin role (fallback)
    else if (user.role === 'admin') {
      roleConfig = { color: 'blue', label: 'Administrator' };
    }
    // Priority 3: Default to user
    else {
      roleConfig = { color: 'gray', label: 'User' };
    }
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${roleConfig.color}-100 text-${roleConfig.color}-800`}>
        {roleConfig.label}
      </span>
    );
  };

  const getStatusBadge = (isActive, suspendedAt) => {
    if (!isActive || suspendedAt) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <Ban size={12} className="mr-1" />
          Disabled
        </span>
      );
    }
    
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <CheckCircle size={12} className="mr-1" />
        Active
      </span>
    );
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
              <Users className="w-6 h-6 text-blue-600" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">User Management</h1>
                <p className="text-sm text-gray-500">Manage system users and their permissions</p>
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex items-center space-x-3">
              {selectedUsers.length > 0 && (
                <div className="text-sm text-amber-600 flex items-center">
                  <div className="w-2 h-2 bg-amber-600 rounded-full mr-2"></div>
                  {selectedUsers.length} selected
                </div>
              )}
              <button
                onClick={fetchUsers}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Search and Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search users by name or email..."
                      value={searchTerm}
                      onChange={handleSearch}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setFiltersOpen(!filtersOpen)}
                    className="inline-flex items-center px-4 py-3 border border-gray-300 shadow-sm text-sm leading-4 font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    Filters
                  </button>
                  {selectedUsers.length > 0 && (
                    <button className="inline-flex items-center px-4 py-3 border border-transparent shadow-sm text-sm leading-4 font-medium text-white bg-red-600 hover:bg-red-700">
                      <Ban className="w-4 h-4 mr-2" />
                      Suspend Selected ({selectedUsers.length})
                    </button>
                  )}
                </div>
              </div>

              {/* Filters Panel */}
              {filtersOpen && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        <option value="">All Status</option>
                        <option value="active">Active</option>
                        <option value="suspended">Suspended</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        <option value="">All Roles</option>
                        <option value="admin">Administrator</option>
                        <option value="user">User</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                      <input
                        type="date"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

      {/* Users Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {users.length === 0 && !loading ? (
              <div className="text-center py-12">
                <Users size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                <p className="text-gray-500">Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left w-12">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedUsers(users.map(user => user.id));
                            } else {
                              setSelectedUsers([]);
                            }
                          }}
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Login
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Joined
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-80">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-4 whitespace-nowrap align-middle">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            checked={selectedUsers.includes(user.id)}
                            onChange={() => toggleUserSelection(user.id)}
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap align-middle">
                          <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 flex-shrink-0">
                              <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                <UserIcon size={20} className="text-gray-600" />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-gray-900">{user.name}</div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap align-middle">
                          {getRoleBadge(user)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap align-middle">
                          {getStatusBadge(user.isActive, user.suspendedAt)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 align-middle">
                          {user.lastLoginAt ? (
                            <div className="flex items-center">
                              <Calendar size={14} className="mr-1" />
                              {formatDate(user.lastLoginAt)}
                            </div>
                          ) : (
                            <span className="text-gray-400">Never</span>
                          )}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 align-middle">
                          {formatDate(user.createdAt)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap align-middle">
                          <div className="flex items-center justify-center space-x-2 min-h-[40px]">
                            {/* Check if current user is the same as this user */}
                            {adminUser?.id === user.id ? (
                              /* Self-impersonation case - Show disabled state */
                              <div className="inline-flex items-center px-3 py-2 border border-gray-200 shadow-sm text-sm leading-4 font-medium text-gray-500 bg-gray-50 opacity-50 cursor-not-allowed transition-all"
                                   title="You are already logged in as this user"
                              >
                                <UserIcon className="w-4 h-4 mr-2" />
                                Current User
                              </div>
                            ) : user.role !== 'admin' && !user.adminRoleId ? (
                              /* Regular user - Show Login as User and Enable/Disable buttons */
                              <div className="flex items-center justify-center space-x-2">
                                {/* Login as User Button */}
                                <button
                                  onClick={() => handleOpenImpersonationModal(user)}
                                  disabled={impersonationLoading}
                                  className="inline-flex items-center px-3 py-2 border border-orange-300 shadow-sm text-sm leading-4 font-medium text-orange-700 bg-orange-50 hover:bg-orange-100 disabled:opacity-50 transition-all hover:shadow-md"
                                  title="Login as this user for support"
                                >
                                  <ExternalLink className="w-4 h-4 mr-2" />
                                  Login as User
                                </button>
                                
                                {/* Enable/Disable User Button */}
                                <button
                                  onClick={() => handleStatusToggle(user.id)}
                                  disabled={impersonationLoading || actionLoading[user.id]}
                                  className={`inline-flex items-center px-3 py-2 border shadow-sm text-sm leading-4 font-medium transition-all hover:shadow-md ${
                                    user.isActive 
                                      ? 'border-red-300 text-red-700 bg-red-50 hover:bg-red-100' 
                                      : 'border-green-300 text-green-700 bg-green-50 hover:bg-green-100'
                                  } ${actionLoading[user.id] ? 'opacity-50 cursor-not-allowed' : ''}`}
                                  title={user.isActive ? 'Disable user account' : 'Enable user account'}
                                >
                                  {actionLoading[user.id] ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                                  ) : user.isActive ? (
                                    <Ban className="w-4 h-4 mr-2" />
                                  ) : (
                                    <UserCheck className="w-4 h-4 mr-2" />
                                  )}
                                  {user.isActive ? 'Disable User' : 'Enable User'}
                                </button>
                              </div>
                            ) : (
                              /* Admin user or no impersonation - Show placeholder for consistency */
                              <div className="inline-flex items-center px-3 py-2 border border-gray-200 shadow-sm text-sm leading-4 font-medium text-gray-500 bg-gray-50">
                                <UserIcon className="w-4 h-4 mr-2" />
                                Admin User
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {users.length} of {totalPages * 12} users
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-3 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <div className="text-sm text-gray-700">
                    Page <span className="font-medium">{currentPage}</span> of{' '}
                    <span className="font-medium">{totalPages}</span>
                  </div>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-3 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Role Change Modal */}
      {showRoleModal && selectedUserForRole && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative bg-white rounded-xl shadow-3xl border border-gray-200 max-w-md w-full mx-4 backdrop-blur-sm">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Settings className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Change User Role</h3>
                  <p className="text-sm text-gray-500">Select a new role for {selectedUserForRole.name}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowRoleModal(false);
                  setSelectedUserForRole(null);
                }}
                className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {availableRoles.map((role) => (
                  <button
                    key={role.id}
                    onClick={() => handleRoleUpdate(role.id)}
                    disabled={actionLoading[selectedUserForRole.id] || role.id === selectedUserForRole.role}
                    className={`w-full text-left px-4 py-3 rounded-lg border transition-all duration-200 font-medium ${
                      role.id === selectedUserForRole.role
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                    } ${
                      actionLoading[selectedUserForRole.id] ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{role.displayName}</div>
                        <div className="text-sm text-gray-500">{role.name}</div>
                      </div>
                      {role.id === selectedUserForRole.role && (
                        <div className="text-blue-600">
                          <CheckCircle size={20} />
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-end p-6 border-t border-gray-200 space-x-3">
              <button
                onClick={() => {
                  setShowRoleModal(false);
                  setSelectedUserForRole(null);
                }}
                disabled={actionLoading[selectedUserForRole.id]}
                className="px-4 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      
      
      {/* Impersonation Modal */}
      <ImpersonationModal
        isOpen={showImpersonationModal}
        onClose={handleCloseImpersonationModal}
        onConfirm={handleImpersonateUser}
        user={selectedUserForImpersonation}
        loading={impersonationLoading}
      />
    </div>
  );
};

export default UserManagement;
