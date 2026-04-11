/**
 * ActivityItem Component
 * Displays a single activity item in the feed
 */

import {
  FolderPlus,
  FolderEdit,
  FolderX,
  ListPlus,
  ListChecks,
  ListX,
  ArrowRightLeft,
  UserPlus,
  UserCheck,
  UserX,
  Shield,
  UserMinus,
  MessageSquare,
  Paperclip,
} from "lucide-react";

// Activity type configuration
const activityConfig = {
  project_created: {
    icon: FolderPlus,
    color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20",
    getText: (meta, actor) => `created the project "${meta.projectName || "this project"}"`,
  },
  project_updated: {
    icon: FolderEdit,
    color: "text-blue-500 bg-blue-50 dark:bg-blue-900/20",
    getText: (meta, actor) => `updated the project settings`,
  },
  project_deleted: {
    icon: FolderX,
    color: "text-rose-500 bg-rose-50 dark:bg-rose-900/20",
    getText: (meta, actor) => `deleted the project`,
  },
  task_created: {
    icon: ListPlus,
    color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20",
    getText: (meta, actor) => `created task "${meta.taskTitle}"`,
  },
  task_updated: {
    icon: ListChecks,
    color: "text-blue-500 bg-blue-50 dark:bg-blue-900/20",
    getText: (meta, actor) => `updated task "${meta.taskTitle}"`,
  },
  task_deleted: {
    icon: ListX,
    color: "text-rose-500 bg-rose-50 dark:bg-rose-900/20",
    getText: (meta, actor) => `deleted task "${meta.taskTitle}"`,
  },
  task_status_changed: {
    icon: ArrowRightLeft,
    color: "text-amber-500 bg-amber-50 dark:bg-amber-900/20",
    getText: (meta, actor) => {
      const statusLabels = {
        TODO: "To Do",
        IN_PROGRESS: "In Progress",
        DONE: "Completed",
        COMPLETED: "Completed",
      };
      const from = statusLabels[meta.fromStatus] || meta.fromStatus;
      const to = statusLabels[meta.toStatus] || meta.toStatus;
      return `moved "${meta.taskTitle}" from ${from} to ${to}`;
    },
  },
  task_assigned: {
    icon: UserPlus,
    color: "text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20",
    getText: (meta, actor) => `assigned "${meta.taskTitle}" to ${meta.assigneeName}`,
  },
  task_unassigned: {
    icon: UserMinus,
    color: "text-slate-500 bg-slate-50 dark:bg-slate-900/20",
    getText: (meta, actor) => `unassigned "${meta.taskTitle}" from ${meta.previousAssignee}`,
  },
  member_invited: {
    icon: UserPlus,
    color: "text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20",
    getText: (meta, actor) => `invited ${meta.email} as ${meta.role}`,
  },
  invitation_accepted: {
    icon: UserCheck,
    color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20",
    getText: (meta, actor) => `joined the project`,
  },
  invitation_declined: {
    icon: UserX,
    color: "text-rose-500 bg-rose-50 dark:bg-rose-900/20",
    getText: (meta, actor) => `declined the invitation`,
  },
  member_role_changed: {
    icon: Shield,
    color: "text-amber-500 bg-amber-50 dark:bg-amber-900/20",
    getText: (meta, actor) => `changed ${meta.memberName}'s role to ${meta.newRole}`,
  },
  member_removed: {
    icon: UserMinus,
    color: "text-rose-500 bg-rose-50 dark:bg-rose-900/20",
    getText: (meta, actor) => `removed ${meta.memberName} from the project`,
  },
  added_comment: {
    icon: MessageSquare,
    color: "text-blue-500 bg-blue-50 dark:bg-blue-900/20",
    getText: (meta, actor) => `commented on "${meta.taskTitle || "a task"}"`,
  },
  uploaded_attachment: {
    icon: Paperclip,
    color: "text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20",
    getText: (meta, actor) => `uploaded an attachment to "${meta.taskTitle || "a task"}"`,
  },
  deleted_attachment: {
    icon: Paperclip,
    color: "text-rose-500 bg-rose-50 dark:bg-rose-900/20",
    getText: (meta, actor) => `removed an attachment from "${meta.taskTitle || "a task"}"`,
  },
};

const defaultConfig = {
  icon: ListChecks,
  color: "text-gray-500 bg-gray-50 dark:bg-gray-900/20",
  getText: (meta, actor) => `performed an action`,
};

/**
 * Format relative time
 */
const formatRelativeTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffWeek = Math.floor(diffDay / 7);
  const diffMonth = Math.floor(diffDay / 30);

  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  if (diffWeek < 4) return `${diffWeek}w ago`;
  if (diffMonth < 12) return `${diffMonth}mo ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const ActivityItem = ({ activity }) => {
  const { action, details, user, createdAt } = activity;
  
  // Backend provides actions like 'created_project', 'updated_task', etc.
  const mappedAction = {
    created_project: 'project_created',
    updated_project: 'project_updated',
    deleted_project: 'project_deleted',
    created_task: 'task_created',
    updated_task: 'task_updated',
    deleted_task: 'task_deleted',
    status_changed: 'task_status_changed',
    assigned: 'task_assigned',
    added_member: 'member_invited',
    removed_member: 'member_removed',
    commented: 'added_comment',
  }[action] || action;

  const config = activityConfig[mappedAction] || defaultConfig;
  const Icon = config.icon;

  // The backend already sends a formatted string in `details` like "Created project XYZ"
  // Let's lowercase the first letter so it looks natural after the user's name.
  let actionText = details || "performed an action";
  if (actionText.length > 0) {
    actionText = actionText.charAt(0).toLowerCase() + actionText.slice(1);
  }

  return (
    <div className="flex items-start gap-3 py-3">
      {/* Icon */}
      <div className={`p-2 rounded-lg ${config.color} flex-shrink-0`}>
        <Icon className="w-4 h-4" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-text-primary">
          <span className="font-medium">
            {user?.name || "Someone"}
          </span>{" "}
          {actionText}
        </p>
        <p className="text-xs text-text-secondary mt-0.5">
          {formatRelativeTime(createdAt)}
        </p>
      </div>
    </div>
  );
};

export default ActivityItem;
