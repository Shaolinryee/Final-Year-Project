/**
 * Alert Component
 * For displaying error, success, warning, and info messages
 */

import { X, AlertCircle, CheckCircle2, AlertTriangle, Info } from "lucide-react";

const variants = {
  error: {
    container: "bg-rose-50 border-rose-200 dark:bg-rose-900/20 dark:border-rose-800",
    icon: "text-rose-500",
    title: "text-rose-800 dark:text-rose-300",
    message: "text-rose-700 dark:text-rose-400",
    Icon: AlertCircle,
  },
  success: {
    container: "bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800",
    icon: "text-emerald-500",
    title: "text-emerald-800 dark:text-emerald-300",
    message: "text-emerald-700 dark:text-emerald-400",
    Icon: CheckCircle2,
  },
  warning: {
    container: "bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800",
    icon: "text-amber-500",
    title: "text-amber-800 dark:text-amber-300",
    message: "text-amber-700 dark:text-amber-400",
    Icon: AlertTriangle,
  },
  info: {
    container: "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800",
    icon: "text-blue-500",
    title: "text-blue-800 dark:text-blue-300",
    message: "text-blue-700 dark:text-blue-400",
    Icon: Info,
  },
};

const Alert = ({
  variant = "info",
  title,
  message,
  onDismiss,
  className = "",
}) => {
  const styles = variants[variant];
  const Icon = styles.Icon;

  return (
    <div
      className={`rounded-lg border p-4 ${styles.container} ${className}`}
      role="alert"
    >
      <div className="flex">
        <div className="flex-shrink-0">
          <Icon className={`h-5 w-5 ${styles.icon}`} />
        </div>
        <div className="ml-3 flex-1">
          {title && (
            <h3 className={`text-sm font-medium ${styles.title}`}>{title}</h3>
          )}
          {message && (
            <p className={`text-sm ${title ? "mt-1" : ""} ${styles.message}`}>
              {message}
            </p>
          )}
        </div>
        {onDismiss && (
          <div className="ml-auto pl-3">
            <button
              onClick={onDismiss}
              className={`inline-flex rounded-md p-1.5 hover:bg-black/5 dark:hover:bg-white/5 focus:outline-none ${styles.icon}`}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alert;
