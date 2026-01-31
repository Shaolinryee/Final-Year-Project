/**
 * Kanban Board Page
 * Displays tasks in columns: TODO, IN_PROGRESS, DONE
 * Supports task creation and status updates
 */

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Plus,
  ArrowLeft,
  MoreHorizontal,
  Calendar,
  User,
  AlertCircle,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { Button, Input, Modal, Textarea, Select, Badge, Drawer } from "../../components/ui";
import {
  getProjectById,
  getProjectTasks,
  createTask,
  updateTaskStatus,
} from "../../services/mock/api.mock";

const COLUMNS = [
  { id: "TODO", title: "To Do", icon: Clock, color: "gray" },
  { id: "IN_PROGRESS", title: "In Progress", icon: AlertCircle, color: "blue" },
  { id: "DONE", title: "Done", icon: CheckCircle2, color: "green" },
];

const PRIORITIES = [
  { value: "LOW", label: "Low", color: "default" },
  { value: "MEDIUM", label: "Medium", color: "info" },
  { value: "HIGH", label: "High", color: "warning" },
  { value: "URGENT", label: "Urgent", color: "danger" },
];

const BoardPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [draggingTask, setDraggingTask] = useState(null);

  useEffect(() => {
    fetchData();
  }, [projectId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [projectData, tasksData] = await Promise.all([
        getProjectById(projectId),
        getProjectTasks(projectId),
      ]);
      setProject(projectData);
      setTasks(tasksData);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (taskData) => {
    try {
      const newTask = await createTask(projectId, taskData);
      setTasks((prev) => [...prev, newTask]);
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error("Failed to create task:", error);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const updatedTask = await updateTaskStatus(taskId, newStatus);
      if (updatedTask) {
        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? updatedTask : t))
        );
      }
    } catch (error) {
      console.error("Failed to update task status:", error);
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e, task) => {
    setDraggingTask(task);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e, columnId) => {
    e.preventDefault();
    if (draggingTask && draggingTask.status !== columnId) {
      handleStatusChange(draggingTask.id, columnId);
    }
    setDraggingTask(null);
  };

  const getTasksByStatus = (status) =>
    tasks.filter((task) => task.status === status);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Project not found
        </h2>
        <Button onClick={() => navigate("/app/projects")}>
          Back to Projects
        </Button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/app/projects")}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-500" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {project.name}
              </h1>
              <Badge variant="primary">{project.key}</Badge>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {project.description || "No description"}
            </p>
          </div>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          leftIcon={<Plus size={18} />}
        >
          Create Task
        </Button>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto">
        <div className="flex gap-4 min-w-max h-full pb-4">
          {COLUMNS.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              tasks={getTasksByStatus(column.id)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.id)}
              onDragStart={handleDragStart}
              onTaskClick={setSelectedTask}
              draggingTask={draggingTask}
            />
          ))}
        </div>
      </div>

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateTask}
      />

      {/* Task Detail Drawer */}
      <TaskDetailDrawer
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
};

// Kanban Column Component
const KanbanColumn = ({
  column,
  tasks,
  onDragOver,
  onDrop,
  onDragStart,
  onTaskClick,
  draggingTask,
}) => {
  const Icon = column.icon;
  const isDropTarget = draggingTask && draggingTask.status !== column.id;

  return (
    <div
      className={`w-80 flex-shrink-0 flex flex-col bg-gray-100 dark:bg-gray-800/50 rounded-xl transition-colors ${
        isDropTarget ? "ring-2 ring-blue-400 ring-opacity-50" : ""
      }`}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      {/* Column Header */}
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon
            size={18}
            className={
              column.color === "gray"
                ? "text-gray-500"
                : column.color === "blue"
                ? "text-blue-500"
                : "text-green-500"
            }
          />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            {column.title}
          </h3>
          <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">
            {tasks.length}
          </span>
        </div>
      </div>

      {/* Tasks */}
      <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-2">
        {tasks.length === 0 ? (
          <div className="text-center py-8 text-gray-400 dark:text-gray-500 text-sm">
            No tasks
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onDragStart={onDragStart}
              onClick={() => onTaskClick(task)}
            />
          ))
        )}
      </div>
    </div>
  );
};

// Task Card Component
const TaskCard = ({ task, onDragStart, onClick }) => {
  const priorityConfig = PRIORITIES.find((p) => p.value === task.priority) || PRIORITIES[1];

  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDueDate = (date) => {
    if (!date) return null;
    const d = new Date(date);
    const today = new Date();
    const diff = Math.ceil((d - today) / (1000 * 60 * 60 * 24));

    if (diff < 0) return { text: "Overdue", color: "text-red-500" };
    if (diff === 0) return { text: "Today", color: "text-orange-500" };
    if (diff === 1) return { text: "Tomorrow", color: "text-yellow-500" };
    return {
      text: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      color: "text-gray-500",
    };
  };

  const dueInfo = formatDueDate(task.dueDate);

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task)}
      onClick={onClick}
      className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 cursor-pointer transition-all hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="font-medium text-gray-900 dark:text-white text-sm line-clamp-2">
          {task.title}
        </h4>
        <button
          onClick={(e) => e.stopPropagation()}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded opacity-0 group-hover:opacity-100"
        >
          <MoreHorizontal size={14} className="text-gray-400" />
        </button>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant={priorityConfig.color} size="sm">
            {priorityConfig.label}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          {dueInfo && (
            <div className={`flex items-center gap-1 text-xs ${dueInfo.color}`}>
              <Calendar size={12} />
              {dueInfo.text}
            </div>
          )}
          {task.assigneeName && (
            <div
              className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-xs font-medium text-blue-600 dark:text-blue-400"
              title={task.assigneeName}
            >
              {getInitials(task.assigneeName)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Create Task Modal Component
const CreateTaskModal = ({ isOpen, onClose, onSubmit }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [assigneeName, setAssigneeName] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    await onSubmit({
      title,
      description,
      priority,
      assigneeName: assigneeName || null,
      dueDate: dueDate || null,
      status: "TODO",
    });
    setLoading(false);
    resetForm();
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setPriority("MEDIUM");
    setAssigneeName("");
    setDueDate("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create Task"
      size="md"
      footer={
        <>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={loading} disabled={!title.trim()}>
            Create Task
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Task Title"
          placeholder="What needs to be done?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          autoFocus
        />

        <Textarea
          label="Description"
          placeholder="Add more details about this task..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            options={PRIORITIES.map((p) => ({
              value: p.value,
              label: p.label,
            }))}
          />

          <Input
            label="Due Date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>

        <Input
          label="Assignee"
          placeholder="Enter assignee name"
          value={assigneeName}
          onChange={(e) => setAssigneeName(e.target.value)}
          leftIcon={<User size={18} />}
        />
      </form>
    </Modal>
  );
};

// Task Detail Drawer Component
const TaskDetailDrawer = ({ task, onClose, onStatusChange }) => {
  if (!task) return null;

  const priorityConfig = PRIORITIES.find((p) => p.value === task.priority) || PRIORITIES[1];

  return (
    <Drawer
      isOpen={!!task}
      onClose={onClose}
      title={`Task Details`}
      width="lg"
    >
      <div className="space-y-6">
        {/* Title */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {task.title}
          </h2>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Status
          </label>
          <div className="flex gap-2">
            {COLUMNS.map((col) => (
              <button
                key={col.id}
                onClick={() => onStatusChange(task.id, col.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  task.status === col.id
                    ? col.id === "TODO"
                      ? "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                      : col.id === "IN_PROGRESS"
                      ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                      : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                {col.title}
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Description
          </label>
          <p className="text-gray-600 dark:text-gray-400">
            {task.description || "No description provided."}
          </p>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Priority
            </label>
            <Badge variant={priorityConfig.color}>{priorityConfig.label}</Badge>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Assignee
            </label>
            <p className="text-gray-900 dark:text-white">
              {task.assigneeName || "Unassigned"}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Due Date
            </label>
            <p className="text-gray-900 dark:text-white">
              {task.dueDate
                ? new Date(task.dueDate).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })
                : "No due date"}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Created
            </label>
            <p className="text-gray-900 dark:text-white">
              {new Date(task.createdAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
        </div>
      </div>
    </Drawer>
  );
};

export default BoardPage;
