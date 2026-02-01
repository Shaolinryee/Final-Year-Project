/**
 * Mock Invitations Data
 * Simulates project invitations for frontend development
 * Status: 'pending' | 'accepted' | 'declined'
 */

export const initialInvitations = [
  // Pending invitation to proj-1 for Bob
  {
    id: "inv-1",
    projectId: "proj-1",
    email: "bob@example.com",
    invitedByUserId: "user-1",
    role: "member",
    status: "pending",
    createdAt: "2026-01-25T10:00:00Z",
  },
  // Pending invitation to proj-2 for an external email
  {
    id: "inv-2",
    projectId: "proj-2",
    email: "external@company.com",
    invitedByUserId: "user-2",
    role: "member",
    status: "pending",
    createdAt: "2026-01-28T14:00:00Z",
  },
];

// In-memory store
let invitations = [...initialInvitations];

export const getInvitationsStore = () => invitations;

export const setInvitationsStore = (newInvitations) => {
  invitations = newInvitations;
};

export const resetInvitationsStore = () => {
  invitations = [...initialInvitations];
};

// Helper functions
export const getInvitationsByProject = (projectId) => {
  return invitations.filter((inv) => inv.projectId === projectId);
};

export const getPendingInvitations = (projectId) => {
  return invitations.filter(
    (inv) => inv.projectId === projectId && inv.status === "pending"
  );
};

export const getInvitationByEmail = (projectId, email) => {
  return invitations.find(
    (inv) =>
      inv.projectId === projectId &&
      inv.email.toLowerCase() === email.toLowerCase() &&
      inv.status === "pending"
  );
};

export const getInvitationsForUser = (email) => {
  return invitations.filter(
    (inv) =>
      inv.email.toLowerCase() === email.toLowerCase() && inv.status === "pending"
  );
};
