/**
 * GlobalActivity Page
 * Shows recent activity across all projects the user is a member of
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Activity, FolderKanban, RefreshCw } from "lucide-react";
import { activityApi, projectsApi, membersApi, usersApi } from "../services/api";
import { Button, EmptyState } from "../components/ui";
import { ActivityItem } from "../components/activity";

const GlobalActivity = () => {
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    fetchActivity();
  }, []);

  const fetchActivity = async () => {
    setLoading(true);

    // Get current user
    const { data: user } = await usersApi.getCurrent();
    setCurrentUser(user);

    // Get all projects
    const { data: projects } = await projectsApi.getAll();

    // For each project, check if user is member and fetch activity
    const allActivities = [];
    for (const project of projects || []) {
      const { data: members } = await membersApi.getByProject(project.id);
      const isMember = members?.some((m) => m.userId === user?.id);

      if (isMember) {
        const { data: projectActivity } = await activityApi.getByProject(project.id, { limit: 10 });
        if (projectActivity) {
          const withProject = projectActivity.map((a) => ({
            ...a,
            projectName: project.name,
            projectKey: project.key,
            projectId: project.id,
          }));
          allActivities.push(...withProject);
        }
      }
    }

    // Sort by date and take latest 50
    allActivities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    setActivities(allActivities.slice(0, 50));
    setLoading(false);
  };

  // Group activities by date
  const groupedActivities = activities.reduce((groups, activity) => {
    const date = new Date(activity.createdAt).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
    if (!groups[date]) groups[date] = [];
    groups[date].push(activity);
    return groups;
  }, {});

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-brand-light rounded animate-pulse" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-brand-light rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Activity</h1>
          <p className="text-text-secondary mt-1">
            Recent activity across your projects
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchActivity}
          disabled={loading}
          leftIcon={<RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />}
        >
          Refresh
        </Button>
      </div>

      {/* Activity Feed */}
      {activities.length === 0 ? (
        <EmptyState
          icon={Activity}
          title="No activity yet"
          description="Activity will appear here as your team works on projects"
          actionLabel="Browse Projects"
          onAction={() => navigate("/projects")}
        />
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedActivities).map(([date, items]) => (
            <div key={date}>
              <h3 className="text-sm font-medium text-text-secondary mb-4">{date}</h3>
              <div className="space-y-1 rounded-xl bg-brand-light border border-brand-border divide-y divide-brand-border">
                {items.map((activity) => (
                  <div
                    key={activity.id}
                    className="px-4 hover:bg-brand-dark/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                    onClick={() => navigate(`/projects/${activity.projectId}/activity`)}
                  >
                    <div className="flex items-center gap-2 py-1 pt-3">
                      <FolderKanban className="w-3.5 h-3.5 text-text-secondary" />
                      <span className="text-xs text-text-secondary">{activity.projectKey || activity.projectName}</span>
                    </div>
                    <ActivityItem activity={activity} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GlobalActivity;
