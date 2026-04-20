import React, { useState } from 'react';
import { AlertTriangle, User as UserIcon, X } from 'lucide-react';

const ImpersonationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  user, 
  loading = false 
}) => {
  const [reason, setReason] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason.trim() || !confirmed) return;
    
    onConfirm(user.id, reason.trim());
    handleClose();
  };

  const handleClose = () => {
    setReason('');
    setConfirmed(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl border border-gray-200 max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
              <UserIcon className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">User Impersonation</h3>
              <p className="text-sm text-gray-500">Access user account for support</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Warning Message */}
          <div className="flex items-start space-x-3 p-4 bg-amber-50 border border-amber-200 rounded-lg mb-6">
            <AlertTriangle className="text-amber-600 mt-0.5" size={20} />
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-amber-800 mb-1">
                You are about to log in as this user
              </h4>
              <p className="text-sm text-amber-700">
                This action will be logged and monitored. Only proceed for legitimate support or debugging purposes.
              </p>
            </div>
          </div>

          {/* User Info */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-3">
              <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center">
                <UserIcon className="h-6 w-6 text-gray-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">{user.name}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
                <p className="text-xs text-gray-400 mt-1">
                  Role: {user.adminRole?.name || 'User'}
                </p>
              </div>
            </div>
          </div>

          {/* Reason Input */}
          <div className="mb-6">
            <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Impersonation <span className="text-red-500">*</span>
            </label>
            <textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please specify the reason for accessing this user account..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              This reason will be logged for audit purposes.
            </p>
          </div>

          {/* Confirmation Checkbox */}
          <div className="mb-6">
            <label className="flex items-start space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">
                I understand this action will be logged and I am accessing this account for legitimate support purposes only.
              </span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={handleClose}
            disabled={loading}
            className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !reason.trim() || !confirmed}
            className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Impersonating...
              </div>
            ) : (
              'Open Portal'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImpersonationModal;
