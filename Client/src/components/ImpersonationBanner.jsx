import React from 'react';
import { ArrowLeft, AlertTriangle, User as UserIcon } from 'lucide-react';

const ImpersonationBanner = ({ 
  userName, 
  userEmail, 
  onReturnToAdmin, 
  loading = false 
}) => {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="h-5 w-5 text-white animate-pulse" />
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">You are logged in as:</span>
              <div className="flex items-center space-x-2 bg-white bg-opacity-20 px-3 py-1 rounded-full">
                <UserIcon className="h-4 w-4" />
                <span className="font-semibold">{userName}</span>
                <span className="text-xs opacity-75">({userEmail})</span>
              </div>
            </div>
          </div>
          
          <button
            onClick={onReturnToAdmin}
            disabled={loading}
            className="flex items-center space-x-2 bg-white text-orange-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600"></div>
                <span>Returning...</span>
              </>
            ) : (
              <>
                <ArrowLeft className="h-4 w-4" />
                <span>Return to Admin</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImpersonationBanner;
