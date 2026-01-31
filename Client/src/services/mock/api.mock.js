/**
 * Mock API Functions
 * Simulates API calls with Promise + setTimeout delay
 * All functions return cloned data to avoid direct reference mutations
 */

import { getProjectsStore, setProjectsStore } from "./projects.mock";
import { getTasksStore, setTasksStore } from "./tasks.mock";

// Simulate network delay (300-800ms)
const delay = (ms = Math.random() * 500 + 300) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// Helper to deep clone objects
const clone = (data) => JSON.parse(JSON.stringify(data));

// Generate unique IDs
const generateId = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Generate project key from name
export const generateProjectKey = (name) => {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 4);
};

/* ==================== PROJECT APIs ==================== */

/**
 * Get all projects
 * @returns {Promise<Array>} Array of projects
 */
export const getProjects = async () => {
  await delay();
  return clone(getProjectsStore());
};

/**
 * Get a single project by ID
 * @param {string} projectId - The project ID
 * @returns {Promise<Object|null>} Project object or null if not found
 */
export const getProjectById = async (projectId) => {
  await delay();
  const project = getProjectsStore().find((p) => p.id === projectId);
  return project ? clone(project) : null;
};

/**
 * Create a new project
 * @param {Object} payload - { name, key?, description? }
 * @returns {Promise<Object>} Created project
 */
export const createProject = async (payload) => {
  await delay();
  
  const newProject = {
    id: generateId("proj"),
    name: payload.name,
    key: payload.key || generateProjectKey(payload.name),
    description: payload.description || "",
    createdAt: new Date().toISOString(),
  };
  
  const projects = getProjectsStore();
  setProjectsStore([...projects, newProject]);
  
  return clone(newProject);
};

/**
 * Update an existing project
 * @param {string} projectId - The project ID
 * @param {Object} payload - Fields to update
 * @returns {Promise<Object|null>} Updated project or null if not found
 */
export const updateProject = async (projectId, payload) => {
  await delay();
  
  const projects = getProjectsStore();
  const index = projects.findIndex((p) => p.id === projectId);
  
  if (index === -1) return null;
  
  const updatedProject = {
    ...projects[index],
    ...payload,
    id: projects[index].id, // Prevent ID override
    createdAt: projects[index].createdAt, // Prevent createdAt override
  };
  
  projects[index] = updatedProject;
  setProjectsStore([...projects]);
  
  return clone(updatedProject);
};

/**
 * Delete a project
 * @param {string} projectId - The project ID
 * @returns {Promise<boolean>} Success status
 */
export const deleteProject = async (projectId) => {
  await delay();
  
  const projects = getProjectsStore();
  const filtered = projects.filter((p) => p.id !== projectId);
  
  if (filtered.length === projects.length) return false;
  
  setProjectsStore(filtered);
  
  // Also delete all tasks for this project
  const tasks = getTasksStore();
  setTasksStore(tasks.filter((t) => t.projectId !== projectId));
  
  return true;
};

/* ==================== TASK APIs ==================== */

/**
 * Get all tasks for a project
 * @param {string} projectId - The project ID
 * @returns {Promise<Array>} Array of tasks
 */
export const getProjectTasks = async (projectId) => {
  await delay();
  const tasks = getTasksStore().filter((t) => t.projectId === projectId);
  return clone(tasks);
};

/**
 * Get a single task by ID
 * @param {string} taskId - The task ID
 * @returns {Promise<Object|null>} Task object or null if not found
 */
export const getTaskById = async (taskId) => {
  await delay();
  const task = getTasksStore().find((t) => t.id === taskId);
  return task ? clone(task) : null;
};

/**
 * Create a new task
 * @param {string} projectId - The project ID
 * @param {Object} payload - { title, description?, status?, priority?, assigneeName?, dueDate? }
 * @returns {Promise<Object>} Created task
 */
export const createTask = async (projectId, payload) => {
  await delay();
  
  const newTask = {
    id: generateId("task"),
    projectId,
    title: payload.title,
    description: payload.description || "",
    status: payload.status || "TODO",
    priority: payload.priority || "MEDIUM",
    assigneeName: payload.assigneeName || null,
    dueDate: payload.dueDate || null,
    createdAt: new Date().toISOString(),
  };
  
  const tasks = getTasksStore();
  setTasksStore([...tasks, newTask]);
  
  return clone(newTask);
};

/**
 * Update task status
 * @param {string} taskId - The task ID
 * @param {string} status - New status (TODO, IN_PROGRESS, DONE)
 * @returns {Promise<Object|null>} Updated task or null if not found
 */
export const updateTaskStatus = async (taskId, status) => {
  await delay();
  
  const tasks = getTasksStore();
  const index = tasks.findIndex((t) => t.id === taskId);
  
  if (index === -1) return null;
  
  tasks[index] = { ...tasks[index], status };
  setTasksStore([...tasks]);
  
  return clone(tasks[index]);
};

/**
 * Update a task
 * @param {string} taskId - The task ID
 * @param {Object} payload - Fields to update
 * @returns {Promise<Object|null>} Updated task or null if not found
 */
export const updateTask = async (taskId, payload) => {
  await delay();
  
  const tasks = getTasksStore();
  const index = tasks.findIndex((t) => t.id === taskId);
  
  if (index === -1) return null;
  
  const updatedTask = {
    ...tasks[index],
    ...payload,
    id: tasks[index].id, // Prevent ID override
    projectId: tasks[index].projectId, // Prevent projectId override
    createdAt: tasks[index].createdAt, // Prevent createdAt override
  };
  
  tasks[index] = updatedTask;
  setTasksStore([...tasks]);
  
  return clone(updatedTask);
};

/**
 * Delete a task
 * @param {string} taskId - The task ID
 * @returns {Promise<boolean>} Success status
 */
export const deleteTask = async (taskId) => {
  await delay();
  
  const tasks = getTasksStore();
  const filtered = tasks.filter((t) => t.id !== taskId);
  
  if (filtered.length === tasks.length) return false;
  
  setTasksStore(filtered);
  return true;
};
