/**
 * Skeleton Component
 * Loading placeholder for content
 */

const Skeleton = ({ className = "", variant = "text" }) => {
  const baseStyles = "animate-pulse bg-brand-dark/10 dark:bg-white/10 rounded";
  
  const variants = {
    text: "h-4 w-full",
    title: "h-6 w-3/4",
    avatar: "h-10 w-10 rounded-full",
    card: "h-32 w-full rounded-xl",
    button: "h-10 w-24 rounded-lg",
  };

  return (
    <div className={`${baseStyles} ${variants[variant]} ${className}`} />
  );
};

// Card skeleton for projects
export const ProjectCardSkeleton = () => (
  <div className="rounded-xl border border-brand-border bg-brand-light p-5 space-y-4">
    <div className="flex items-start justify-between">
      <Skeleton className="h-12 w-12 rounded-xl" />
      <Skeleton className="h-6 w-16 rounded-full" />
    </div>
    <div className="space-y-2">
      <Skeleton variant="title" />
      <Skeleton variant="text" className="w-full" />
      <Skeleton variant="text" className="w-2/3" />
    </div>
    <div className="flex gap-2 pt-2">
      <Skeleton variant="button" />
      <Skeleton variant="button" />
    </div>
  </div>
);

// Task item skeleton
export const TaskItemSkeleton = () => (
  <div className="rounded-lg border border-brand-border bg-brand-light p-4 flex items-center gap-4">
    <Skeleton className="h-5 w-5 rounded" />
    <div className="flex-1 space-y-2">
      <Skeleton variant="text" className="w-1/2" />
      <Skeleton variant="text" className="w-1/4" />
    </div>
    <Skeleton className="h-6 w-20 rounded-full" />
  </div>
);

export default Skeleton;
