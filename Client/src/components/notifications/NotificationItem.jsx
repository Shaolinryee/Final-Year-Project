import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UserPlus, 
  UserCheck, 
  ClipboardList, 
  MessageSquare, 
  RefreshCw,
  Circle
} from 'lucide-react';
import { NOTIFICATION_TYPES } from '../../services/mock/notifications.mock';
import { formatCompactTime } from './groupByDate';

/**
 * Get icon component based on notification type
 */
const getNotificationIcon = (type) => {
  const iconMap = {
    [NOTIFICATION_TYPES.INVITE_RECEIVED]: { icon: UserPlus, color: 'text-blue-400', bg: 'bg-blue-500/20' },
    [NOTIFICATION_TYPES.INVITE_ACCEPTED]: { icon: UserCheck, color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
    [NOTIFICATION_TYPES.TASK_ASSIGNED]: { icon: ClipboardList, color: 'text-violet-400', bg: 'bg-violet-500/20' },
    [NOTIFICATION_TYPES.TASK_COMMENT]: { icon: MessageSquare, color: 'text-amber-400', bg: 'bg-amber-500/20' },
    [NOTIFICATION_TYPES.TASK_STATUS_CHANGED]: { icon: RefreshCw, color: 'text-cyan-400', bg: 'bg-cyan-500/20' },
  };
  
  return iconMap[type] || { icon: Circle, color: 'text-slate-400', bg: 'bg-slate-500/20' };
};

/**
 * NotificationItem - Compact Jira-style notification card
 */
const NotificationItem = ({ notification, onMarkAsRead, onClose }) => {
  const navigate = useNavigate();
  const { icon: Icon, color, bg } = getNotificationIcon(notification.type);
  
  // Normalize the read field (API returns 'read', mock returns 'isRead')
  const isRead = notification.read ?? notification.isRead ?? false;
  const createdAt = notification.created_at || notification.createdAt;
  
  const handleClick = () => {
    // Mark as read if unread
    if (!isRead) {
      onMarkAsRead?.(notification.id);
    }
    
    // Navigate to link if available
    if (notification.link) {
      onClose?.();
      navigate(notification.link);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };
  
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={`
        group relative flex items-start gap-3 px-4 py-3 cursor-pointer
        transition-all duration-150 outline-none
        hover:bg-slate-800/60 focus:bg-slate-800/60
        ${!isRead ? 'bg-blue-950/30' : 'bg-transparent'}
      `}
    >
      {/* Unread indicator dot */}
      {!isRead && (
        <div className="absolute left-1.5 top-1/2 -translate-y-1/2">
          <span className="flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
        </div>
      )}
      
      {/* Icon container */}
      <div className={`flex-shrink-0 w-9 h-9 rounded-lg ${bg} flex items-center justify-center mt-0.5 transition-transform group-hover:scale-105`}>
        <Icon className={`w-4.5 h-4.5 ${color}`} strokeWidth={2} />
      </div>
      
      {/* Content */}
      <div className="flex-1 min-w-0 pr-2">
        {/* Title */}
        <p className={`text-xs font-semibold uppercase tracking-wide mb-0.5 ${!isRead ? 'text-blue-400' : 'text-slate-500'}`}>
          {notification.title}
        </p>
        {/* Message */}
        <p className={`text-sm leading-relaxed line-clamp-2 ${!isRead ? 'text-slate-200' : 'text-slate-400'}`}>
          {notification.message}
        </p>
      </div>
      
      {/* Timestamp */}
      <div className="flex-shrink-0 text-right">
        <span className={`text-xs tabular-nums ${!isRead ? 'text-slate-400' : 'text-slate-500'}`}>
          {formatCompactTime(createdAt)}
        </span>
      </div>
    </div>
  );
};

export default NotificationItem;