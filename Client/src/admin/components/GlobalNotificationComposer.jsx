import React, { useState } from 'react';
import { X, Send, AlertTriangle, Info, CheckCircle, Bell, Users } from 'lucide-react';
import { notificationsApi } from '../services/notificationsApi';
import { toast } from 'react-toastify';

const GlobalNotificationComposer = ({ isOpen, onClose, onSuccess }) => {
  const [notification, setNotification] = useState({
    title: '',
    message: '',
    priority: 'MEDIUM',
    actionLink: '',
    expiresAt: ''
  });
  const [sending, setSending] = useState(false);

  // Handle form changes
  const handleChange = (field, value) => {
    setNotification(prev => ({ ...prev, [field]: value }));
  };

  // Send notification
  const sendNotification = async () => {
    // Validation
    if (!notification.title.trim()) {
      toast.error('Title is required');
      return;
    }

    if (!notification.message.trim()) {
      toast.error('Message is required');
      return;
    }

    setSending(true);
    try {
      const payload = {
        ...notification,
        details: {
          sentVia: 'global_composer',
          timestamp: new Date().toISOString()
        }
      };

      if (notification.expiresAt) {
        payload.expiresAt = new Date(notification.expiresAt).toISOString();
      }

      const response = await notificationsApi.sendGlobal(payload);
      
      if (!response.data) {
        toast.error('Failed to send notification');
        return;
      }

      toast.success('Global notification sent successfully');
      onSuccess && onSuccess();
      
      // Reset form
      setNotification({
        title: '',
        message: '',
        priority: 'MEDIUM',
        actionLink: '',
        expiresAt: ''
      });
      
      onClose();
    } catch (error) {
      toast.error('Failed to send notification');
    } finally {
      setSending(false);
    }
  };

  // Get priority icon and color
  const getPriorityInfo = (priority) => {
    switch (priority) {
      case 'CRITICAL':
        return { icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200' };
      case 'HIGH':
        return { icon: AlertTriangle, color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-200' };
      case 'MEDIUM':
        return { icon: Info, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-200' };
      case 'LOW':
        return { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50', border: 'border-green-200' };
      default:
        return { icon: Bell, color: 'text-gray-500', bg: 'bg-gray-50', border: 'border-gray-200' };
    }
  };

  if (!isOpen) return null;

  const currentPriorityInfo = getPriorityInfo(notification.priority);
  const PriorityIcon = currentPriorityInfo.icon;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden border border-gray-200 backdrop-blur-sm">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Send className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Send Global Notification</h2>
              <p className="text-sm text-gray-600">Send a notification to all administrators</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Priority Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Priority Level
            </label>
            <div className="grid grid-cols-4 gap-3">
              {['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((priority) => {
                const priorityInfo = getPriorityInfo(priority);
                const Icon = priorityInfo.icon;
                
                return (
                  <label
                    key={priority}
                    className={`relative flex flex-col items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                      notification.priority === priority
                        ? `${priorityInfo.border} ${priorityInfo.bg}`
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="priority"
                      value={priority}
                      checked={notification.priority === priority}
                      onChange={(e) => handleChange('priority', e.target.value)}
                      className="sr-only"
                    />
                    <Icon className={`w-6 h-6 mb-1 ${priorityInfo.color}`} />
                    <span className="text-sm font-medium">{priority}</span>
                  </label>
                );
              })}
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Higher priority notifications will be delivered immediately via more channels
            </p>
          </div>

          {/* Title */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={notification.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Enter notification title"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              maxLength={200}
            />
            <p className="text-sm text-gray-600 mt-1">
              {notification.title.length}/200 characters
            </p>
          </div>

          {/* Message */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message <span className="text-red-500">*</span>
            </label>
            <textarea
              value={notification.message}
              onChange={(e) => handleChange('message', e.target.value)}
              placeholder="Enter notification message"
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              maxLength={1000}
            />
            <p className="text-sm text-gray-600 mt-1">
              {notification.message.length}/1000 characters
            </p>
          </div>

          {/* Action Link */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Action Link (Optional)
            </label>
            <input
              type="url"
              value={notification.actionLink}
              onChange={(e) => handleChange('actionLink', e.target.value)}
              placeholder="https://example.com/action"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-sm text-gray-600 mt-1">
              Users can click this link to view more details or take action
            </p>
          </div>

          {/* Expiration */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expires At (Optional)
            </label>
            <input
              type="datetime-local"
              value={notification.expiresAt}
              onChange={(e) => handleChange('expiresAt', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-sm text-gray-600 mt-1">
              Notification will be hidden after this time. Leave empty for no expiration.
            </p>
          </div>

          {/* Preview */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Preview
            </label>
            <div className={`p-4 rounded-lg border ${currentPriorityInfo.border} ${currentPriorityInfo.bg}`}>
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${currentPriorityInfo.bg}`}>
                  <PriorityIcon className={`w-5 h-5 ${currentPriorityInfo.color}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs px-2 py-1 rounded-full ${currentPriorityInfo.bg} ${currentPriorityInfo.color}`}>
                      {notification.priority}
                    </span>
                    <span className="text-xs text-gray-500 uppercase tracking-wide">
                      Global Announcement
                    </span>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    {notification.title || 'Notification Title'}
                  </h3>
                  <p className="text-gray-600 mb-2">
                    {notification.message || 'Notification message will appear here...'}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>Just now</span>
                    <span>by You</span>
                    <span>Global Composer</span>
                  </div>
                  {notification.actionLink && (
                    <div className="mt-2">
                      <a
                        href={notification.actionLink}
                        className="text-blue-600 hover:text-blue-700 text-sm"
                      >
                        View Details
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Recipients Info */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-blue-900">Recipients</span>
            </div>
            <p className="text-sm text-blue-800">
              This notification will be sent to all active administrators in the system.
              Each admin will receive it based on their notification preferences.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={sendNotification}
            disabled={sending || !notification.title.trim() || !notification.message.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Send Notification
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GlobalNotificationComposer;
