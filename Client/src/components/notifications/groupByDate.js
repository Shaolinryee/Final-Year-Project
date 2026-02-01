/**
 * Date Grouping Helper for Notifications
 * Groups notifications into TODAY / YESTERDAY / OLDER buckets (Jira-style)
 */

/**
 * Check if two dates are the same calendar day
 */
const isSameDay = (date1, date2) => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

/**
 * Check if a date is yesterday relative to today
 */
const isYesterday = (date, today) => {
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  return isSameDay(date, yesterday);
};

/**
 * Group notifications by date buckets
 * @param {Array} notifications - Array of notifications with createdAt or created_at field
 * @returns {Object} { today: [], yesterday: [], older: [] }
 */
export const groupNotificationsByDate = (notifications) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const groups = {
    today: [],
    yesterday: [],
    older: [],
  };
  
  notifications.forEach((notification) => {
    // Support both createdAt and created_at field names
    const dateStr = notification.createdAt || notification.created_at;
    const notifDate = new Date(dateStr);
    
    if (isSameDay(notifDate, today)) {
      groups.today.push(notification);
    } else if (isYesterday(notifDate, today)) {
      groups.yesterday.push(notification);
    } else {
      groups.older.push(notification);
    }
  });
  
  // Each group is already sorted by the API (newest first)
  // But ensure consistency
  const sortByDate = (a, b) => {
    const dateA = new Date(a.createdAt || a.created_at);
    const dateB = new Date(b.createdAt || b.created_at);
    return dateB - dateA;
  };
  
  groups.today.sort(sortByDate);
  groups.yesterday.sort(sortByDate);
  groups.older.sort(sortByDate);
  
  return groups;
};

/**
 * Get date bucket label for a notification
 * @param {Object} notification
 * @returns {string} 'TODAY' | 'YESTERDAY' | 'OLDER'
 */
export const getDateBucket = (notification) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dateStr = notification.createdAt || notification.created_at;
  const notifDate = new Date(dateStr);
  
  if (isSameDay(notifDate, today)) return 'TODAY';
  if (isYesterday(notifDate, today)) return 'YESTERDAY';
  return 'OLDER';
};

/**
 * Format relative time in compact format (Jira-style)
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted time like "5m", "2h", "3d"
 */
export const formatCompactTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) return 'now';
  if (diffInSeconds < 3600) {
    const mins = Math.floor(diffInSeconds / 60);
    return `${mins}m`;
  }
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h`;
  }
  if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}d`;
  }
  if (diffInSeconds < 2592000) {
    const weeks = Math.floor(diffInSeconds / 604800);
    return `${weeks}w`;
  }
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export default groupNotificationsByDate;
