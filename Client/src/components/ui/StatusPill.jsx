/**
 * StatusPill Component
 * Displays status badges for projects and tasks
 */

const statusStyles = {
  // Project statuses
  active: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  archived: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400",
  
  // Task statuses
  todo: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  in_progress: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  in_review: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300",
  done: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  completed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  rejected: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
  support: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
  
  // Priority
  low: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  medium: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  high: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  urgent: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
};

const statusLabels = {
  active: "Active",
  archived: "Archived",
  todo: "To Do",
  in_progress: "In Progress",
  // in_review: "In Review",
  done: "Done",
  completed: "Completed",
  rejected: "Rejected",
  support: "Support",
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

const StatusPill = ({ status, className = "" }) => {
  const normalizedStatus = (() => {
    const value = status?.toLowerCase().replace("-", "_") || "todo";
    return value === "completed" ? "done" : value;
  })();
  const style = statusStyles[normalizedStatus] || statusStyles.todo;
  const label = statusLabels[normalizedStatus] || status;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${style} ${className}`}
    >
      {label}
    </span>
  );
};

export default StatusPill;
