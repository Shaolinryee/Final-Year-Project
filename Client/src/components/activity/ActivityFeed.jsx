/**
 * ActivityFeed Component
 * Displays project activity history
 */

import { useState, useEffect } from "react";
import { Activity, RefreshCw } from "lucide-react";
import ActivityItem from "./ActivityItem";
import { Button, EmptyState } from "../ui";

const ActivityFeed = ({
  activities = [],
  loading = false,
  hasMore = false,
  onLoadMore,
  onRefresh,
}) => {
  if (loading && activities.length === 0) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-start gap-3 py-3 animate-pulse">
            <div className="w-10 h-10 rounded-lg bg-brand-dark/10 dark:bg-white/10" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-brand-dark/10 dark:bg-white/10 rounded w-3/4" />
              <div className="h-3 bg-brand-dark/10 dark:bg-white/10 rounded w-1/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <EmptyState
        icon={Activity}
        title="No activity yet"
        description="Activity will appear here as team members work on the project"
      />
    );
  }

  return (
    <div className="space-y-1">
      {/* Header with Refresh */}
      {onRefresh && (
        <div className="flex justify-end pb-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            disabled={loading}
            leftIcon={<RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />}
          >
            Refresh
          </Button>
        </div>
      )}

      {/* Activity List */}
      <div className="divide-y divide-brand-border">
        {activities.map((activity) => (
          <ActivityItem key={activity.id} activity={activity} />
        ))}
      </div>

      {/* Load More */}
      {hasMore && (
        <div className="pt-4 text-center">
          <Button
            variant="outline"
            size="sm"
            onClick={onLoadMore}
            disabled={loading}
          >
            {loading ? "Loading..." : "Load More"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default ActivityFeed;
