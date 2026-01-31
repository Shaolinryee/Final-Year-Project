/**
 * Reusable Badge component
 * For status indicators, tags, and labels
 */

const variants = {
  default:
    "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
  primary:
    "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  success:
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  warning:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  danger:
    "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  info:
    "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400",
  purple:
    "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
};

const sizes = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-1 text-xs",
  lg: "px-3 py-1.5 text-sm",
};

const Badge = ({
  children,
  variant = "default",
  size = "md",
  dot = false,
  className = "",
  ...props
}) => {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5 font-medium rounded-full
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
      {...props}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            variant === "default"
              ? "bg-gray-500"
              : variant === "primary"
              ? "bg-blue-500"
              : variant === "success"
              ? "bg-green-500"
              : variant === "warning"
              ? "bg-yellow-500"
              : variant === "danger"
              ? "bg-red-500"
              : variant === "info"
              ? "bg-cyan-500"
              : "bg-purple-500"
          }`}
        />
      )}
      {children}
    </span>
  );
};

export default Badge;
