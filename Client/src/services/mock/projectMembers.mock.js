/**
 * Mock Project Members Data
 * Simulates project membership for frontend development
 * Roles: 'owner' | 'member'
 */

export const initialProjectMembers = [
  // CollabWeb Platform (proj-1) - John is owner, Jane and Alice are members
  {
    projectId: "proj-1",
    userId: "user-1",
    role: "owner",
    joinedAt: "2025-11-15T10:00:00Z",
  },
  {
    projectId: "proj-1",
    userId: "user-2",
    role: "member",
    joinedAt: "2025-11-16T11:00:00Z",
  },
  {
    projectId: "proj-1",
    userId: "user-3",
    role: "member",
    joinedAt: "2025-11-20T09:30:00Z",
  },

  // Mobile App (proj-2) - Jane is owner, Bob is member
  {
    projectId: "proj-2",
    userId: "user-2",
    role: "owner",
    joinedAt: "2025-12-01T14:30:00Z",
  },
  {
    projectId: "proj-2",
    userId: "user-4",
    role: "member",
    joinedAt: "2025-12-05T10:00:00Z",
  },

  // API Gateway (proj-3) - Alice is owner
  {
    projectId: "proj-3",
    userId: "user-3",
    role: "owner",
    joinedAt: "2026-01-10T09:15:00Z",
  },
];

// In-memory store
let projectMembers = [...initialProjectMembers];

export const getProjectMembersStore = () => projectMembers;

export const setProjectMembersStore = (newMembers) => {
  projectMembers = newMembers;
};

export const resetProjectMembersStore = () => {
  projectMembers = [...initialProjectMembers];
};

// Helper functions
export const getMembersByProject = (projectId) => {
  return projectMembers.filter((pm) => pm.projectId === projectId);
};

export const getMemberRole = (projectId, userId) => {
  const member = projectMembers.find(
    (pm) => pm.projectId === projectId && pm.userId === userId
  );
  return member?.role || null;
};

export const isProjectOwner = (projectId, userId) => {
  return getMemberRole(projectId, userId) === "owner";
};

export const getProjectOwners = (projectId) => {
  return projectMembers.filter(
    (pm) => pm.projectId === projectId && pm.role === "owner"
  );
};
