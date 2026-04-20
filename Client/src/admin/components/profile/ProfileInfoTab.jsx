import React, { useState, useRef } from 'react';
import { Camera, Edit2, Save, X, Mail, User, Globe, Bell } from 'lucide-react';
import { profileApi } from '../../services/adminApi';
import { toast } from 'react-toastify';
import { useAuth } from '../../../context/AuthContext';

const ProfileInfoTab = ({ profileData, onProfileUpdate }) => {
  const { updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: ''
  });
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Initialize edit form when profile data changes
  React.useEffect(() => {
    if (profileData?.admin) {
      setEditForm({
        name: profileData.admin.name || '',
        email: profileData.admin.email || ''
      });
    }
  }, [profileData]);

  const handleEdit = () => {
    setIsEditing(true);
    setEditForm({
      name: profileData?.admin?.name || '',
      email: profileData?.admin?.email || ''
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditForm({
      name: profileData?.admin?.name || '',
      email: profileData?.admin?.email || ''
    });
  };

  const handleSave = async () => {
    try {
      const response = await profileApi.updateProfile(editForm);
      if (response.data?.success) {
        toast.success('Profile updated successfully');
        // Update auth context with new profile data
        updateUser({ name: editForm.name, email: editForm.email });
        setIsEditing(false);
        onProfileUpdate();
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  };

  const handlePhotoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error('Image size should be less than 5MB');
      return;
    }

    const formData = new FormData();
    formData.append('photo', file);

    try {
      setUploading(true);
      const response = await profileApi.uploadProfilePhoto(formData);
      if (response.data?.success) {
        toast.success('Profile photo updated successfully');
        // Update auth context with new avatar
        updateUser({ avatar: response.data.data.avatar });
        onProfileUpdate();
      }
    } catch (error) {
      console.error('Failed to upload photo:', error);
      toast.error(error.response?.data?.message || 'Failed to upload photo');
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const admin = profileData?.admin || {};
  const stats = profileData?.stats || {};

  return (
    <div className="space-y-6">
      {/* Profile Photo Section */}
      <div className="flex items-center space-x-6">
        <div className="relative">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
            {admin.avatar ? (
              <img 
                src={`http://localhost:5000${admin.avatar}`} 
                alt={admin.name} 
                className="w-24 h-24 rounded-full object-cover"
              />
            ) : (
              admin.name?.charAt(0).toUpperCase() || 'A'
            )}
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {uploading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Camera className="w-4 h-4" />
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            className="hidden"
          />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Profile Photo</h3>
          <p className="text-sm text-gray-500">JPG, PNG or GIF. Max size 5MB</p>
        </div>
      </div>

      {/* Basic Information */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
          {!isEditing ? (
            <button
              onClick={handleEdit}
              className="flex items-center space-x-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Edit2 className="w-4 h-4" />
              <span>Edit</span>
            </button>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                onClick={handleSave}
                className="flex items-center space-x-2 px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>Save</span>
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center space-x-2 px-3 py-2 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="w-4 h-4 inline mr-2" />
              Full Name
            </label>
            {isEditing ? (
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            ) : (
              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                {admin.name || 'Not set'}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Mail className="w-4 h-4 inline mr-2" />
              Email Address
            </label>
            {isEditing ? (
              <input
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            ) : (
              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                {admin.email || 'Not set'}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Admin Statistics */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Administrator Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Total Users</p>
                <p className="text-2xl font-bold text-blue-900">{stats.totalUsers || 0}</p>
              </div>
              <User className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Active Users</p>
                <p className="text-2xl font-bold text-green-900">{stats.activeUsers || 0}</p>
              </div>
              <Globe className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">Total Logins</p>
                <p className="text-2xl font-bold text-purple-900">{stats.loginCount || 0}</p>
              </div>
              <Bell className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Account Information */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role
            </label>
            <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {admin.role || 'Administrator'}
              </span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Account Status
            </label>
            <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Active
              </span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Last Login
            </label>
            <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
              {stats.lastLogin ? new Date(stats.lastLogin).toLocaleString() : 'Never'}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Member Since
            </label>
            <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
              {admin.createdAt ? new Date(admin.createdAt).toLocaleDateString() : 'Unknown'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileInfoTab;
