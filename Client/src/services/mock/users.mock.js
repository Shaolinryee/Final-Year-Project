/**
 * Mock Users Data
 * Simulates user data for frontend development
 */

export const initialUsers = [
  {
    id: "user-1",
    name: "John Doe",
    email: "john@example.com",
    avatarUrl: null,
    createdAt: "2025-10-01T10:00:00Z",
  },
  {
    id: "user-2",
    name: "Jane Smith",
    email: "jane@example.com",
    avatarUrl: null,
    createdAt: "2025-10-05T14:30:00Z",
  },
  {
    id: "user-3",
    name: "Alice Brown",
    email: "alice@example.com",
    avatarUrl: null,
    createdAt: "2025-10-10T09:15:00Z",
  },
  {
    id: "user-4",
    name: "Bob Wilson",
    email: "bob@example.com",
    avatarUrl: null,
    createdAt: "2025-11-01T11:00:00Z",
  },
  {
    id: "user-5",
    name: "Carol Davis",
    email: "carol@example.com",
    avatarUrl: null,
    createdAt: "2025-11-15T16:30:00Z",
  },
];

// In-memory store
let users = [...initialUsers];

// The "current" logged-in user (simulates auth context)
// This should be updated when real auth is integrated
// Change this to test different user perspectives:
// - "user-1" = John Doe (owner of proj-1)
// - "user-2" = Jane Smith (owner of proj-2)
// - "user-3" = Alice Brown (owner of proj-3)
// - "user-4" = Bob Wilson (has pending invite to proj-1)
// - "user-5" = Carol Davis
let currentUserId = "user-3"; // Bob Wilson - to test accepting invitation

export const getUsersStore = () => users;

export const setUsersStore = (newUsers) => {
  users = newUsers;
};

export const resetUsersStore = () => {
  users = [...initialUsers];
  currentUserId = "user-5";
};

export const getCurrentUserId = () => currentUserId;

export const setCurrentUserId = (userId) => {
  currentUserId = userId;
};

// Helper to find user by email (for invitation simulation)
export const findUserByEmail = (email) => {
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase());
};
