/**
 * Mock Activity Data
 * Simulates project activity feed for frontend development
 * 
 * Activity types:
 * - project_created, project_updated, project_deleted
 * - task_created, task_updated, task_deleted
 * - task_status_changed, task_assigned, task_unassigned
 * - member_invited, invitation_accepted, invitation_declined
 * - member_role_changed, member_removed
 */

export const initialActivity = [
  // CollabWeb Platform (proj-1) activity
  {
    id: "act-1",
    projectId: "proj-1",
    actorUserId: "user-1",
    type: "project_created",
    meta: { projectName: "CollabWeb Platform" },
    createdAt: "2025-11-15T10:00:00Z",
  },
  {
    id: "act-2",
    projectId: "proj-1",
    actorUserId: "user-1",
    type: "member_invited",
    meta: { email: "jane@example.com", role: "member" },
    createdAt: "2025-11-16T10:30:00Z",
  },
  {
    id: "act-3",
    projectId: "proj-1",
    actorUserId: "user-2",
    type: "invitation_accepted",
    meta: {},
    createdAt: "2025-11-16T11:00:00Z",
  },
  {
    id: "act-4",
    projectId: "proj-1",
    actorUserId: "user-1",
    type: "task_created",
    meta: { taskTitle: "Set up project structure" },
    createdAt: "2025-11-15T10:30:00Z",
  },
  {
    id: "act-5",
    projectId: "proj-1",
    actorUserId: "user-1",
    type: "task_assigned",
    meta: { taskTitle: "Set up project structure", assigneeName: "John Doe" },
    createdAt: "2025-11-15T10:35:00Z",
  },
  {
    id: "act-6",
    projectId: "proj-1",
    actorUserId: "user-2",
    type: "task_status_changed",
    meta: { taskTitle: "Set up project structure", fromStatus: "TODO", toStatus: "IN_PROGRESS" },
    createdAt: "2025-11-18T09:00:00Z",
  },
  {
    id: "act-7",
    projectId: "proj-1",
    actorUserId: "user-1",
    type: "task_status_changed",
    meta: { taskTitle: "Set up project structure", fromStatus: "IN_PROGRESS", toStatus: "DONE" },
    createdAt: "2025-11-19T15:00:00Z",
  },
  {
    id: "act-8",
    projectId: "proj-1",
    actorUserId: "user-1",
    type: "member_invited",
    meta: { email: "alice@example.com", role: "member" },
    createdAt: "2025-11-19T16:00:00Z",
  },
  {
    id: "act-9",
    projectId: "proj-1",
    actorUserId: "user-3",
    type: "invitation_accepted",
    meta: {},
    createdAt: "2025-11-20T09:30:00Z",
  },
  {
    id: "act-10",
    projectId: "proj-1",
    actorUserId: "user-1",
    type: "task_created",
    meta: { taskTitle: "Implement authentication flow" },
    createdAt: "2025-11-16T09:00:00Z",
  },
  {
    id: "act-11",
    projectId: "proj-1",
    actorUserId: "user-1",
    type: "task_assigned",
    meta: { taskTitle: "Implement authentication flow", assigneeName: "Jane Smith" },
    createdAt: "2025-11-16T09:05:00Z",
  },

  // Mobile App (proj-2) activity
  {
    id: "act-20",
    projectId: "proj-2",
    actorUserId: "user-2",
    type: "project_created",
    meta: { projectName: "Mobile App" },
    createdAt: "2025-12-01T14:30:00Z",
  },
  {
    id: "act-21",
    projectId: "proj-2",
    actorUserId: "user-2",
    type: "member_invited",
    meta: { email: "bob@example.com", role: "member" },
    createdAt: "2025-12-04T10:00:00Z",
  },
  {
    id: "act-22",
    projectId: "proj-2",
    actorUserId: "user-4",
    type: "invitation_accepted",
    meta: {},
    createdAt: "2025-12-05T10:00:00Z",
  },

  // API Gateway (proj-3) activity
  {
    id: "act-30",
    projectId: "proj-3",
    actorUserId: "user-3",
    type: "project_created",
    meta: { projectName: "API Gateway" },
    createdAt: "2026-01-10T09:15:00Z",
  },
];

// In-memory store
let activity = [...initialActivity];

export const getActivityStore = () => activity;

export const setActivityStore = (newActivity) => {
  activity = newActivity;
};

export const resetActivityStore = () => {
  activity = [...initialActivity];
};

// Helper functions
export const getActivityByProject = (projectId, options = {}) => {
  const { limit = 50, offset = 0 } = options;
  const filtered = activity
    .filter((act) => act.projectId === projectId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  return filtered.slice(offset, offset + limit);
};

export const addActivity = (activityItem) => {
  activity = [activityItem, ...activity];
};
