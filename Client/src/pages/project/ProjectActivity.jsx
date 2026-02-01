/**
 * ProjectActivity - Activity log page for a project
 */

import { Activity, RefreshCw } from "lucide-react";
import { useProject } from "./ProjectLayout";
import { Button, EmptyState } from "../../components/ui";
import { ActivityFeed } from "../../components/activity";

const ProjectActivity = () => {
  const {
    project,
    activities,
    activityLoading,
    fetchActivity,
  } = useProject();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Activity</h1>
          <p className="text-text-secondary mt-1">
            Recent activity in {project?.name}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchActivity}
          disabled={activityLoading}
          leftIcon={<RefreshCw className={`w-4 h-4 ${activityLoading ? "animate-spin" : ""}`} />}
        >
          Refresh
        </Button>
      </div>

      {/* Activity Feed */}
      {activityLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-brand-light rounded-xl animate-pulse" />
          ))}
        </div>
      ) : activities.length === 0 ? (
        <EmptyState
          icon={Activity}
          title="No activity yet"
          description="Activity will appear here as the team works on this project"
        />
      ) : (
        <ActivityFeed activities={activities} />
      )}
    </div>
  );
};

export default ProjectActivity;
