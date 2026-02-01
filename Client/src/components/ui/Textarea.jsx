/**
 * Reusable Textarea component
 */

import { forwardRef } from "react";

const Textarea = forwardRef(
  (
    {
      label,
      error,
      helperText,
      className = "",
      containerClassName = "",
      rows = 4,
      ...props
    },
    ref
  ) => {
    return (
      <div className={`w-full ${containerClassName}`}>
        {label && (
          <label className="block text-sm font-medium text-text-primary mb-1">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          rows={rows}
          className={`
            w-full px-4 py-2.5 rounded-lg border transition-colors resize-none
            bg-brand-light
            text-text-primary
            placeholder-text-secondary
            focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent
            disabled:bg-brand-dark/10 dark:disabled:bg-gray-700 disabled:cursor-not-allowed
            ${
              error
                ? "border-red-500 dark:border-red-400"
                : "border-brand-border"
            }
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-500 dark:text-red-400">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1 text-sm text-text-secondary">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

export default Textarea;
