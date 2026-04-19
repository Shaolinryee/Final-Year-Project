/**
 * Kanban Board Page
 * Displays tasks in columns: todo, in-progress, done
 * Supports task creation, drag-and-drop, and task detail drawer
 */

import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Plus,
  ArrowLeft,
  Clock,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Filter,
  Search as SearchIcon,
  User as UserIcon,
  X,
  XCircle,
  HelpCircle,
} from "lucide-react";
import { Button, Badge, ConfirmDialog } from "../components/ui";
import { TaskFormModal } from "../components/tasks";
import { projectsApi, tasksApi, membersApi } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";

// Column configuration
const COLUMNS = [
  { id: "todo", title: "To Do", icon: Clock, color: "gray" },
  { id: "in-progress", title: "In Progress", icon: AlertCircle, color: "blue" },
  { id: "done", title: "Done", icon: CheckCircle2, color: "green" },
  { id: "rejected", title: "Rejected", icon: XCircle, color: "red" },
  { id: "support", title: "Supported", icon: HelpCircle, color: "cyan" },
];

// Priority configuration
const PRIORITIES = [
  { value: "low", label: "Low", color: "default" },
  { value: "medium", label: "Medium", color: "info" },
  { value: "high", label: "High", color: "warning" },
  { value: "urgent", label: "Urgent", color: "danger" },
];

// ==================== Task Card Component ====================
const TaskCard = ({ task, onDragStart, onClick }) => {
  const [isDragging, setIsDragging] = useState(false);
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
      color: "text-gray-500 dark:text-gray-400",
    };
  };

  const dueInfo = formatDueDate(task.dueDate);

  
  const handleMouseDown = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    if (!isDragging) {
      onClick(task);
    }
    setIsDragging(false);
  };

  return (
    <div
      draggable
      onDragStart={(e) => {
        setIsDragging(true);
        onDragStart(e, task);
      }}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      className="group bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 cursor-pointer transition-all hover:shadow-md relative"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="font-medium text-gray-900 dark:text-white text-sm line-clamp-2">
          {task.title}
        </h4>
      </div>

      {task.description && (
        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-2">
          {task.description}
        </p>
      )}

      <div className="flex items-center justify-between">
        <Badge variant={priorityConfig.color} size="sm">
          {priorityConfig.label}
        </Badge>

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

// ==================== Kanban Column Component ====================
const KanbanColumn = ({
  column,
  tasks,
  onDragOver,
  onDrop,
  onDragStart,
  onTaskClick,
  isDragTarget,
}) => {
  const Icon = column.icon;
  const colorClasses = {
    gray: "text-gray-500",
    blue: "text-blue-500",
    green: "text-emerald-500",
    red: "text-red-500",
    cyan: "text-cyan-500",
  };

  return (
    <div
      className={`w-72 flex-shrink-0 flex flex-col bg-gray-100 dark:bg-gray-800/50 rounded-xl transition-all ${
        isDragTarget ? "ring-2 ring-blue-400 ring-opacity-50" : ""
      }`}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      {/* Column Header */}
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon size={18} className={colorClasses[column.color]} />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            {column.title}
          </h3>
          <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">
            {tasks.length}
          </span>
        </div>
      </div>

      {/* Tasks List */}
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


// ==================== Main Boards Component ====================
const Boards = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket, joinProject, leaveProject } = useSocket();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [draggingTask, setDraggingTask] = useState(null);
  const [createLoading, setCreateLoading] = useState(false);
  
  
  // Filter state
  const [filters, setFilters] = useState({
    priority: "all",
    assignee: "all",
    q: ""
  });
  const [members, setMembers] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch project and tasks on mount
  useEffect(() => {
    if (projectId) {
      fetchData();
      
      // Join project room for real-time updates
      joinProject(projectId);
      
      return () => {
        leaveProject(projectId);
      };
    }
  }, [projectId, joinProject, leaveProject]);

  // Socket event listeners
  useEffect(() => {
    if (socket && projectId) {
      const handleTaskCreated = (data) => {
        if (data.userId === user?.id) return;
        setTasks((prev) => [data.task, ...prev]);
      };

      const handleTaskUpdated = (data) => {
        if (data.userId === user?.id) return;
        setTasks((prev) => prev.map((t) => (t.id === data.task.id ? data.task : t)));
      };

      const handleTaskDeleted = (data) => {
        if (data.userId === user?.id) return;
        setTasks((prev) => prev.filter((t) => t.id !== data.taskId));
      };

      const handleProjectUpdated = (data) => {
        if (data.userId === user?.id) return;
        setProject(data.project);
      };

      const handleProjectDeleted = (data) => {
        if (data.projectId === projectId) {
          navigate("/projects", { state: { message: "Project was deleted by owner" } });
        }
      };

      socket.on('task_created', handleTaskCreated);
      socket.on('task_updated', handleTaskUpdated);
      socket.on('task_deleted', handleTaskDeleted);
      socket.on('project_updated', handleProjectUpdated);
      socket.on('project_deleted', handleProjectDeleted);

      return () => {
        socket.off('task_created', handleTaskCreated);
        socket.off('task_updated', handleTaskUpdated);
        socket.off('task_deleted', handleTaskDeleted);
        socket.off('project_updated', handleProjectUpdated);
        socket.off('project_deleted', handleProjectDeleted);
      };
    }
  }, [socket, projectId, user?.id, navigate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [projectRes, tasksRes, membersRes] = await Promise.all([
        projectsApi.getById(projectId),
        tasksApi.getByProject(projectId),
        membersApi.getByProject(projectId),
      ]);
      setProject(projectRes.data);
      setTasks(tasksRes.data || []);
      setMembers(membersRes.data || []);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = !filters.q || 
        task.title?.toLowerCase().includes(filters.q.toLowerCase()) ||
        task.description?.toLowerCase().includes(filters.q.toLowerCase());
      
      const matchesPriority = filters.priority === "all" || task.priority === filters.priority;
      const matchesAssignee = filters.assignee === "all" || task.assigneeId === filters.assignee;
      
      return matchesSearch && matchesPriority && matchesAssignee;
    });
  }, [tasks, filters]);

  // Group tasks by status
  const getTasksByStatus = (status) =>
    filteredTasks.filter((task) => task.status === status);

  // Handle task creation
  const handleCreateTask = async (taskData) => {
    setCreateLoading(true);
    try {
      const { data, error } = await tasksApi.create(projectId, {
        ...taskData,
        status: "todo",
      });
      if (data) {
        setTasks((prev) => [...prev, data]);
        setIsCreateModalOpen(false);
      }
    } catch (error) {
      console.error("Failed to create task:", error);
    } finally {
      setCreateLoading(false);
    }
  };

  
  // Handle status change
  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const { data, error } = await tasksApi.updateStatus(taskId, newStatus);
      if (data) {
        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? data : t))
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

  const handleDragEnd = () => {
    setDraggingTask(null);
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Project not found
  if (!project) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Project not found
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          The project you're looking for doesn't exist or you don't have access.
        </p>
        <Button onClick={() => navigate("/projects")}>Back to Projects</Button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col" onDragEnd={handleDragEnd}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/projects")}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Back to projects"
          >
            <ArrowLeft size={20} className="text-gray-500" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {project.name}
              </h1>
              {project.key && <Badge variant="primary">{project.key}</Badge>}
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {project.description || "No description"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className={showFilters || filters.priority !== "all" || filters.assignee !== "all" || filters.q !== "" ? "border-brand text-brand" : ""}
            leftIcon={<Filter size={18} />}
          >
            Filters
            {(filters.priority !== "all" || filters.assignee !== "all" || filters.q !== "") && (
              <span className="ml-2 w-2 h-2 bg-brand rounded-full"></span>
            )}
          </Button>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            leftIcon={<Plus size={18} />}
          >
            Create Task
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      {showFilters && (
        <div className="bg-brand-dark/20 border border-brand-border rounded-xl p-4 mb-6 animate-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            {/* Search */}
            <div className="space-y-1.5 text-left">
              <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest px-1">Search</label>
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                <input
                  type="text"
                  placeholder="Find a task..."
                  value={filters.q}
                  onChange={(e) => setFilters(prev => ({ ...prev, q: e.target.value }))}
                  className="w-full pl-9 pr-3 py-2 bg-brand-light border border-brand-border rounded-lg text-sm text-text-primary focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all"
                />
              </div>
            </div>

            {/* Assignee */}
            <div className="space-y-1.5 text-left">
              <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest px-1">Assignee</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                <select
                  value={filters.assignee}
                  onChange={(e) => setFilters(prev => ({ ...prev, assignee: e.target.value }))}
                  className="w-full pl-9 pr-3 py-2 bg-brand-light border border-brand-border rounded-lg text-sm text-text-primary focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all appearance-none"
                >
                  <option value="all">Everyone</option>
                  {members.map(m => (
                    <option key={m.userId} value={m.userId}>{m.user?.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Priority */}
            <div className="space-y-1.5 text-left">
              <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest px-1">Priority</label>
              <div className="relative">
                <AlertCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                <select
                  value={filters.priority}
                  onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                  className="w-full pl-9 pr-3 py-2 bg-brand-light border border-brand-border rounded-lg text-sm text-text-primary focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all appearance-none"
                >
                  <option value="all">Any Priority</option>
                  {PRIORITIES.map(p => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFilters({ priority: "all", assignee: "all", q: "" })}
                className="text-text-secondary hover:text-text-primary"
                leftIcon={<X size={14} />}
              >
                Clear
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto px-4">
        <div className="flex justify-between h-full pb-4 min-w-[640px] gap-0">
          {COLUMNS.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              tasks={getTasksByStatus(column.id)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.id)}
              onDragStart={handleDragStart}
              onTaskClick={(task) => {
        navigate(`/projects/${projectId}/tasks/${task.id}`, { 
          state: { from: `/projects/${projectId}/board` }
        });
      }}
              isDragTarget={draggingTask && draggingTask.status !== column.id}
            />
          ))}
        </div>
      </div>

// ...
      {/* Create Task Modal */}
      <TaskFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateTask}
        loading={createLoading}
      />

      
          </div>
  );
};

export default Boards;
