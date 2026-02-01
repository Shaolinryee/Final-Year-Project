/**
 * Mock Projects Data
 * Simulates project data for frontend development
 */

export const initialProjects = [
  {
    id: "proj-1",
    name: "CollabWeb Platform",
    key: "CWP",
    description: "Main project management platform development with core features like task tracking, team collaboration, and reporting.",
    status: "active",
    createdAt: "2025-11-15T10:00:00Z",
  },
  {
    id: "proj-2",
    name: "Mobile App",
    key: "MOB",
    description: "Native mobile application for iOS and Android with offline support and push notifications.",
    status: "active",
    createdAt: "2025-12-01T14:30:00Z",
  },
  {
    id: "proj-3",
    name: "API Gateway",
    key: "API",
    description: "Central API gateway service for managing authentication, rate limiting, and request routing.",
    status: "archived",
    createdAt: "2026-01-10T09:15:00Z",
  },
];

// In-memory store that can be mutated
let projects = [...initialProjects];

export const getProjectsStore = () => projects;

export const setProjectsStore = (newProjects) => {
  projects = newProjects;
};

export const resetProjectsStore = () => {
  projects = [...initialProjects];
};
