/**
 * Notifications Page (Placeholder)
 */

import { Bell } from "lucide-react";

const NotificationsPage = () => {
  return (
    <div className="text-center py-20">
      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
        <Bell size={32} className="text-gray-400" />
      </div>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        Notifications
      </h2>
      <p className="text-gray-500 dark:text-gray-400">
        No new notifications at this time.
      </p>
    </div>
  );
};

export default NotificationsPage;
