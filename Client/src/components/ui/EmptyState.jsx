/**
 * EmptyState Component
 * Displays when no data is available
 */

import Button from "./Button";

const EmptyState = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className = "",
}) => {
  return (
    <div className={`text-center py-12 ${className}`}>
      {Icon && (
        <div className="mx-auto w-16 h-16 bg-brand-dark/10 dark:bg-white/10 rounded-full flex items-center justify-center mb-4">
          <Icon className="w-8 h-8 text-text-secondary" />
        </div>
      )}
      <h3 className="text-lg font-medium text-text-primary mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-text-secondary mb-6 max-w-sm mx-auto">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <Button onClick={onAction}>{actionLabel}</Button>
      )}
    </div>
  );
};

export default EmptyState;
