/**
 * TaskItem Component
 * Displays a task in the list with status controls and assignment
 */

import { useState } from "react";
import {
  CheckCircle2,
  Circle,
  Clock,
  Edit2,
  Trash2,
  ChevronDown,
  Calendar,
  User,
  UserCircle,
} from "lucide-react";
import { StatusPill, Button } from "../ui";
import { canUpdateTaskStatus } from "../../utils/permissions";

const statusConfig = {
  todo: {
    icon: Circle,
    label: "To Do",
    color: "text-slate-500",
    next: "in_progress",
  },
  in_progress: {
    icon: Clock,
    label: "In Progress",
    color: "text-blue-500",
    next: "completed",
  },
  completed: {
    icon: CheckCircle2,
    label: "Completed",
    color: "text-emerald-500",
    next: "todo",
  },
};

const TaskItem = ({
  task,
  onStatusChange,
  onEdit,
  onDelete,
  onAssign,
  onClick,
  members = [],
  currentUserId,
  userRole,
  loading = false,
  compact = false,
}) => {
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showAssignMenu, setShowAssignMenu] = useState(false);
  
  const status = task.status?.toLowerCase().replace("-", "_") || "todo";
  const config = statusConfig[status] || statusConfig.todo;
  const StatusIcon = config.icon;

  // Check if current user can update this task's status
  const canChangeStatus = onStatusChange && canUpdateTaskStatus(userRole, task, currentUserId);

  const handleStatusClick = () => {
    if (canChangeStatus) {
      setShowStatusMenu(!showStatusMenu);
    }
  };

  const handleStatusSelect = (newStatus) => {
    setShowStatusMenu(false);
    if (newStatus !== status && onStatusChange) {
      onStatusChange(task.id, newStatus);
    }
  };

  const handleAssignSelect = (userId) => {
    setShowAssignMenu(false);
    if (userId !== task.assignedToUserId) {
      onAssign?.(task.id, userId);
    }
  };

  // Get assigned user info
  const getAssignee = () => {
    if (!task.assignedToUserId) return null;
    const member = members.find((m) => m.userId === task.assignedToUserId);
    if (member?.user) return member.user;
    // Fallback to assigneeName if user not found in members
    if (task.assigneeName) {
      return { name: task.assigneeName, id: task.assignedToUserId };
    }
    return { name: "Unknown User", id: task.assignedToUserId };
  };

  const assignee = getAssignee();

  // Get initials for avatar
  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDueDate = (date) => {
    if (!date) return null;
    const d = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDay = new Date(d);
    dueDay.setHours(0, 0, 0, 0);
    const diff = Math.ceil((dueDay - today) / (1000 * 60 * 60 * 24));

    if (diff < 0) return { text: "Overdue", isOverdue: true };
    if (diff === 0) return { text: "Today", isOverdue: false };
    if (diff === 1) return { text: "Tomorrow", isOverdue: false };
    return {
      text: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      isOverdue: false,
    };
  };

  const dueInfo = formatDueDate(task.dueDate);

  const handleCardClick = (e) => {
    // Don't trigger card click if clicking on interactive elements
    if (
      e.target.closest('button') ||
      e.target.closest('[role="menu"]') ||
      e.target.closest('.dropdown-trigger')
    ) {
      return;
    }
    onClick?.();
  };

  return (
    <div
      className={`rounded-lg border bg-brand-light p-4 transition-all ${
        status === "completed"
          ? "border-emerald-200 dark:border-emerald-800/50 bg-emerald-50/50 dark:bg-emerald-900/10"
          : "border-brand-border hover:border-indigo-300 dark:hover:border-indigo-700"
      } ${onClick ? "cursor-pointer" : ""}`}
      onClick={handleCardClick}
    >
      <div className="flex items-start gap-3">
        {/* Status Toggle */}
        <div className="relative">
          <button
            onClick={handleStatusClick}
            disabled={loading || !canChangeStatus}
            className={`p-1 rounded-lg transition-colors ${config.color} ${
              canChangeStatus 
                ? "hover:bg-brand-dark/10 dark:hover:bg-white/10 cursor-pointer" 
                : "cursor-default opacity-70"
            }`}
            title={canChangeStatus ? "Change status" : "You cannot change this task's status"}
          >
            <StatusIcon className="w-5 h-5" />
          </button>

          {/* Status Dropdown */}
          {showStatusMenu && canChangeStatus && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowStatusMenu(false)}
              />
              <div className="absolute left-0 top-full mt-1 w-40 bg-brand-light rounded-lg shadow-lg border border-brand-border py-1 z-20">
                {Object.entries(statusConfig).map(([key, cfg]) => {
                  const Icon = cfg.icon;
                  return (
                    <button
                      key={key}
                      onClick={() => handleStatusSelect(key)}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-brand-dark/10 dark:hover:bg-white/10 ${
                        key === status
                          ? "bg-brand-dark/5 dark:bg-white/5"
                          : ""
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${cfg.color}`} />
                      <span className="text-text-primary">
                        {cfg.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4
              className={`font-medium ${
                status === "completed"
                  ? "text-text-secondary line-through"
                  : "text-text-primary"
              }`}
            >
              {task.title}
            </h4>
            {/* Edit/Delete buttons - only show if user has permission */}
            {(onEdit || onDelete) && (
              <div className="flex items-center gap-1 flex-shrink-0">
                {onEdit && (
                  <button
                    onClick={() => onEdit(task)}
                    className="p-1.5 text-text-secondary hover:text-text-primary hover:bg-brand-dark/10 dark:hover:bg-white/10 rounded-lg transition-colors"
                    title="Edit task"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => onDelete(task)}
                    className="p-1.5 text-text-secondary hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
                    title="Delete task"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>

          {task.description && (
            <p className="text-sm text-text-secondary mt-1 line-clamp-2">
              {task.description}
            </p>
          )}

          {/* Meta */}
          <div className="flex items-center gap-3 mt-3 flex-wrap">
            <StatusPill status={status} />
            
            {task.priority && (
              <StatusPill status={task.priority} />
            )}

            {/* Assignee Chip */}
            <div className="relative">
              <button
                onClick={() => setShowAssignMenu(!showAssignMenu)}
                disabled={loading || !onAssign}
                className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                  assignee
                    ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
                    : "bg-brand-dark/10 text-text-secondary dark:bg-white/10"
                } ${onAssign ? "hover:opacity-80 cursor-pointer" : "cursor-default"}`}
              >
                {assignee ? (
                  <>
                    <div className="w-4 h-4 rounded-full bg-indigo-200 dark:bg-indigo-800 flex items-center justify-center text-[10px] font-medium">
                      {getInitials(assignee.name)}
                    </div>
                    {assignee.name}
                  </>
                ) : (
                  <>
                    <UserCircle className="w-4 h-4" />
                    Unassigned
                  </>
                )}
                {onAssign && <ChevronDown className="w-3 h-3" />}
              </button>

              {/* Assign Dropdown */}
              {showAssignMenu && onAssign && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowAssignMenu(false)}
                  />
                  <div className="absolute left-0 top-full mt-1 w-48 bg-brand-light rounded-lg shadow-lg border border-brand-border py-1 z-20 max-h-60 overflow-y-auto">
                    {/* Unassign Option */}
                    <button
                      onClick={() => handleAssignSelect(null)}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-brand-dark/10 dark:hover:bg-white/10 ${
                        !task.assignedToUserId ? "bg-brand-dark/5 dark:bg-white/5" : ""
                      }`}
                    >
                      <UserCircle className="w-4 h-4 text-text-secondary" />
                      <span className="text-text-primary">Unassigned</span>
                    </button>
                    
                    {members.length > 0 && (
                      <div className="border-t border-brand-border my-1" />
                    )}
                    
                    {/* Member Options */}
                    {members.map(({ userId, user }) => (
                      <button
                        key={userId}
                        onClick={() => handleAssignSelect(userId)}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-brand-dark/10 dark:hover:bg-white/10 ${
                          task.assignedToUserId === userId ? "bg-brand-dark/5 dark:bg-white/5" : ""
                        }`}
                      >
                        <div className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-xs font-medium text-indigo-600 dark:text-indigo-400">
                          {getInitials(user?.name)}
                        </div>
                        <span className="text-text-primary truncate">
                          {user?.name || "Unknown"}
                        </span>
                      </button>
                    ))}
                    
                    {members.length === 0 && (
                      <p className="px-3 py-2 text-xs text-text-secondary">
                        No members to assign
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>

            {dueInfo && (
              <span
                className={`inline-flex items-center gap-1 text-xs ${
                  dueInfo.isOverdue
                    ? "text-rose-600 dark:text-rose-400"
                    : "text-text-secondary"
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                {dueInfo.text}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskItem;
