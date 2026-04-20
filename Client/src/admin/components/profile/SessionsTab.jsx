import React, { useState, useEffect } from 'react';
import { Clock, Monitor, Smartphone, Globe, X, LogOut, RefreshCw } from 'lucide-react';
import { profileApi } from '../../services/adminApi';
import { toast } from 'react-toastify';

const SessionsTab = ({ profileData }) => {
  const [activeSessions, setActiveSessions] = useState([]);
  const [loginHistory, setLoginHistory] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchActiveSessions = async () => {
    try {
      setLoadingSessions(true);
      const response = await profileApi.getActiveSessions();
      if (response.data?.data) {
        setActiveSessions(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch active sessions:', error);
      toast.error('Failed to load active sessions');
    } finally {
      setLoadingSessions(false);
    }
  };

  const fetchLoginHistory = async (page = 1) => {
    try {
      setLoadingHistory(true);
      const response = await profileApi.getLoginHistory({ page, limit: 10 });
      if (response.data?.data) {
        setLoginHistory(response.data.data.logs);
        setTotalPages(response.data.data.pagination?.totalPages || 1);
        setCurrentPage(response.data.data.pagination?.page || 1);
      }
    } catch (error) {
      console.error('Failed to fetch login history:', error);
      toast.error('Failed to load login history');
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleRevokeSession = async (sessionId) => {
    try {
      const response = await profileApi.revokeSession(sessionId);
      if (response.data?.success) {
        toast.success('Session revoked successfully');
        fetchActiveSessions();
      }
    } catch (error) {
      console.error('Failed to revoke session:', error);
      toast.error('Failed to revoke session');
    }
  };

  const getDeviceIcon = (userAgent) => {
    if (userAgent?.includes('Mobile') || userAgent?.includes('Android') || userAgent?.includes('iPhone')) {
      return Smartphone;
    }
    return Monitor;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
  };

  useEffect(() => {
    fetchActiveSessions();
    fetchLoginHistory();
  }, []);

  return (
    <div className="space-y-6">
      {/* Active Sessions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-blue-600" />
            Active Sessions
          </h3>
          <button
            onClick={fetchActiveSessions}
            className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>

        {loadingSessions ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : activeSessions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No active sessions found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeSessions.map((session) => {
              const DeviceIcon = getDeviceIcon(session.userAgent);
              return (
                <div key={session.id} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <DeviceIcon className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="text-sm font-medium text-gray-900">
                            {session.deviceInfo?.browser || 'Unknown Browser'}
                          </h4>
                          {session.isCurrent && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Current Session
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                          <span className="flex items-center">
                            <Globe className="w-3 h-3 mr-1" />
                            {session.ipAddress || 'Unknown IP'}
                          </span>
                          <span>
                            Last active: {formatRelativeTime(session.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                    {!session.isCurrent && (
                      <button
                        onClick={() => handleRevokeSession(session.id)}
                        className="flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4" />
                        <span>Revoke</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Login History */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-blue-600" />
            Login History
          </h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => fetchLoginHistory(currentPage)}
              className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {loadingHistory ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : loginHistory.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No login history found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {loginHistory.map((login) => {
              const DeviceIcon = getDeviceIcon(login.userAgent);
              return (
                <div key={login.id} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <DeviceIcon className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">
                          {login.userAgent?.includes('Chrome') ? 'Chrome' :
                           login.userAgent?.includes('Firefox') ? 'Firefox' :
                           login.userAgent?.includes('Safari') ? 'Safari' : 'Unknown Browser'}
                        </h4>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                          <span className="flex items-center">
                            <Globe className="w-3 h-3 mr-1" />
                            {login.ipAddress || 'Unknown IP'}
                          </span>
                          <span>{formatDate(login.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-gray-500">
                        {formatRelativeTime(login.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-700">
              Showing page {currentPage} of {totalPages}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => fetchLoginHistory(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => fetchLoginHistory(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Security Recommendations */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Recommendations</h3>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Clock className="w-3 h-3 text-blue-600" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-blue-800">Review Active Sessions</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Regularly review your active sessions and revoke any that you don't recognize.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Globe className="w-3 h-3 text-blue-600" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-blue-800">Monitor Login History</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Check your login history for any suspicious activity or unknown locations.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <LogOut className="w-3 h-3 text-blue-600" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-blue-800">Sign Out When Done</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Always sign out from shared or public computers to protect your account.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionsTab;
