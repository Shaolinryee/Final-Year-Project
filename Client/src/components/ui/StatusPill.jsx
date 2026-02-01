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
  completed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  
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
  completed: "Completed",
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

const StatusPill = ({ status, className = "" }) => {
  const normalizedStatus = status?.toLowerCase().replace("-", "_") || "todo";
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
