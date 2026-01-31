/**
 * Mock Tasks Data
 * Simulates task data for frontend development
 * Status values: TODO, IN_PROGRESS, DONE
 * Priority values: LOW, MEDIUM, HIGH, URGENT
 */

export const initialTasks = [
  // CollabWeb Platform tasks (proj-1)
  {
    id: "task-1",
    projectId: "proj-1",
    title: "Set up project structure",
    description: "Initialize React project with Vite, configure Tailwind CSS, and set up folder structure.",
    status: "DONE",
    priority: "HIGH",
    assigneeName: "John Doe",
    dueDate: "2025-11-20",
    createdAt: "2025-11-15T10:30:00Z",
  },
  {
    id: "task-2",
    projectId: "proj-1",
    title: "Implement authentication flow",
    description: "Build login, signup, OTP verification, and password reset using Supabase Auth.",
    status: "DONE",
    priority: "URGENT",
    assigneeName: "Jane Smith",
    dueDate: "2025-11-25",
    createdAt: "2025-11-16T09:00:00Z",
  },
  {
    id: "task-3",
    projectId: "proj-1",
    title: "Build dashboard layout",
    description: "Create responsive dashboard with sidebar navigation and main content area.",
    status: "IN_PROGRESS",
    priority: "HIGH",
    assigneeName: "John Doe",
    dueDate: "2026-02-05",
    createdAt: "2025-11-20T14:00:00Z",
  },
  {
    id: "task-4",
    projectId: "proj-1",
    title: "Create project management UI",
    description: "Build project listing, creation modal, and project detail pages.",
    status: "IN_PROGRESS",
    priority: "MEDIUM",
    assigneeName: "Alice Brown",
    dueDate: "2026-02-10",
    createdAt: "2025-12-01T11:00:00Z",
  },
  {
    id: "task-5",
    projectId: "proj-1",
    title: "Implement drag-and-drop Kanban",
    description: "Build Kanban board with drag-and-drop functionality for task management.",
    status: "TODO",
    priority: "HIGH",
    assigneeName: "Jane Smith",
    dueDate: "2026-02-15",
    createdAt: "2025-12-05T10:00:00Z",
  },
  {
    id: "task-6",
    projectId: "proj-1",
    title: "Add notification system",
    description: "Implement real-time notifications for task assignments and updates.",
    status: "TODO",
    priority: "LOW",
    assigneeName: null,
    dueDate: "2026-02-28",
    createdAt: "2025-12-10T16:00:00Z",
  },

  // Mobile App tasks (proj-2)
  {
    id: "task-7",
    projectId: "proj-2",
    title: "Design mobile wireframes",
    description: "Create wireframes for all main screens of the mobile application.",
    status: "DONE",
    priority: "HIGH",
    assigneeName: "Mike Wilson",
    dueDate: "2025-12-15",
    createdAt: "2025-12-01T15:00:00Z",
  },
  {
    id: "task-8",
    projectId: "proj-2",
    title: "Set up React Native project",
    description: "Initialize React Native project with required dependencies and configuration.",
    status: "IN_PROGRESS",
    priority: "MEDIUM",
    assigneeName: "Mike Wilson",
    dueDate: "2026-02-01",
    createdAt: "2025-12-16T09:30:00Z",
  },
  {
    id: "task-9",
    projectId: "proj-2",
    title: "Implement offline storage",
    description: "Add SQLite or AsyncStorage for offline data persistence.",
    status: "TODO",
    priority: "HIGH",
    assigneeName: null,
    dueDate: "2026-02-20",
    createdAt: "2025-12-20T11:00:00Z",
  },

  // API Gateway tasks (proj-3)
  {
    id: "task-10",
    projectId: "proj-3",
    title: "Design API architecture",
    description: "Plan API endpoints, authentication flow, and rate limiting strategy.",
    status: "DONE",
    priority: "URGENT",
    assigneeName: "Sarah Davis",
    dueDate: "2026-01-15",
    createdAt: "2026-01-10T09:30:00Z",
  },
  {
    id: "task-11",
    projectId: "proj-3",
    title: "Implement JWT authentication",
    description: "Set up JWT-based authentication with refresh token rotation.",
    status: "IN_PROGRESS",
    priority: "HIGH",
    assigneeName: "Sarah Davis",
    dueDate: "2026-02-05",
    createdAt: "2026-01-16T10:00:00Z",
  },
  {
    id: "task-12",
    projectId: "proj-3",
    title: "Add rate limiting",
    description: "Implement rate limiting middleware with Redis backend.",
    status: "TODO",
    priority: "MEDIUM",
    assigneeName: null,
    dueDate: "2026-02-25",
    createdAt: "2026-01-20T14:00:00Z",
  },
];

// In-memory store that can be mutated
let tasks = [...initialTasks];

export const getTasksStore = () => tasks;

export const setTasksStore = (newTasks) => {
  tasks = newTasks;
};

export const resetTasksStore = () => {
  tasks = [...initialTasks];
};
