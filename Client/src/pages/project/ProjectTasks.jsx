/**
 * ProjectTasks - Tasks management page for a project
 */

import { useState, useMemo } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Plus,
  ListTodo,
  LayoutGrid,
  List,
  Search,
  AlertCircle,
  Clock,
  CheckCircle2,
  X,
  User,
  XCircle,
  HelpCircle,
} from "lucide-react";
import { useProject } from "./ProjectLayout";
import { tasksApi, attachmentsApi } from "../../services/api";
import {
  Button,
  Alert,
  EmptyState,
  ConfirmDialog,
  TaskItemSkeleton,
} from "../../components/ui";
import { TaskItem, TaskFormModal } from "../../components/tasks";
import {
  canCreateTask,
  canEditAnyTask,
  canDeleteTask,
  canAssignTasks,
  canUpdateTaskStatus,
} from "../../utils/permissions";

const ProjectTasks = () => {
  const navigate = useNavigate();
  const {
    project,
    tasks,
    members,
    tasksLoading,
    setTasks,
    fetchTasks,
    projectId,
    userRole,
    currentUser,
  } = useProject();

  // Permission checks
  const canCreate = canCreateTask(userRole);
  const canEditAny = canEditAnyTask(userRole);
  const canDelete = canDeleteTask(userRole);
  const canAssign = canAssignTasks(userRole);

  // Filter state
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState("list"); // list or grid
  const [filters, setFilters] = useState({
    q: "",
    assignee: "all",
    priority: "all"
  });
  const [showFilters, setShowFilters] = useState(false);

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingTask, setDeletingTask] = useState(null);
  const [error, setError] = useState(null);
  const [formError, setFormError] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  const normalizeStatusForUI = (status) => {
    const normalized = (status || "todo").toLowerCase().replace("-", "_");
    if (normalized === "completed") return "done";
    return normalized;
  };

  const normalizeStatusForApi = (status) => {
    const normalized = (status || "todo").toLowerCase().replace("_", "-");
    if (normalized === "completed") return "done";
    return normalized;
  };

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Status filter
      if (statusFilter !== "all") {
        const taskStatus = normalizeStatusForUI(task.status);
        if (taskStatus !== statusFilter) return false;
      }
      
      // Search filter
      const matchesSearch = !filters.q || 
        task.title?.toLowerCase().includes(filters.q.toLowerCase()) ||
        task.description?.toLowerCase().includes(filters.q.toLowerCase());
      if (!matchesSearch) return false;
      
      // Assignee filter
      const assigneeId = task.assigneeId ?? task.assignedToUserId;
      if (filters.assignee !== "all" && assigneeId !== filters.assignee) return false;
      
      // Priority filter
      if (filters.priority !== "all" && task.priority !== filters.priority) return false;

      return true;
    });
  }, [tasks, statusFilter, filters]);

  // Task counts
  const taskCounts = useMemo(() => {
    return {
      all: tasks.length,
      todo: tasks.filter((t) => normalizeStatusForUI(t.status) === "todo").length,
      in_progress: tasks.filter((t) => normalizeStatusForUI(t.status) === "in_progress").length,
      done: tasks.filter((t) => normalizeStatusForUI(t.status) === "done").length,
      rejected: tasks.filter((t) => normalizeStatusForUI(t.status) === "rejected").length,
      support: tasks.filter((t) => normalizeStatusForUI(t.status) === "support").length,
    };
  }, [tasks]);

  // Handlers
  const handleCreate = () => {
    setEditingTask(null);
    setFormError(null);
    setIsFormOpen(true);
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setFormError(null);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (task) => {
    setDeletingTask(task);
    setIsDeleteOpen(true);
  };

  const handleFormSubmit = async (formData, filesToUpload = []) => {
    setFormLoading(true);
    setError(null);
    setFormError(null);

    try {
      const payload = {
        ...formData,
        status: normalizeStatusForApi(formData.status),
      };

      if (editingTask) {
        const { data, error } = await tasksApi.update(editingTask.id, payload);
        if (error) throw new Error(error);

        if (filesToUpload.length > 0) {
          await Promise.all(
            filesToUpload.map((f) => attachmentsApi.upload(editingTask.id, f))
          );
        }

        setTasks((prev) =>
          prev.map((t) => (t.id === editingTask.id ? data : t))
        );
        toast.success("Task updated successfully");
      } else {
        const { data, error } = await tasksApi.create(projectId, payload);
        if (error) throw new Error(error);

        if (filesToUpload.length > 0) {
          await Promise.all(
            filesToUpload.map((f) => attachmentsApi.upload(data.id, f))
          );
        }

        setTasks((prev) => [...prev, data]);
        toast.success("Task created successfully");
      }

      setIsFormOpen(false);
      setEditingTask(null);
    } catch (err) {
      setFormError(err.message);
      toast.error(err.message || "Failed to save task");
    } finally {
      setFormLoading(false);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    setError(null);

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, status: normalizeStatusForApi(newStatus) } : t
      )
    );

    try {
      const { error } = await tasksApi.updateStatus(taskId, normalizeStatusForApi(newStatus));
      if (error) throw new Error(error);
      toast.success("Task status updated");
    } catch (err) {
      fetchTasks();
      setError(err.message);
      toast.error(err.message || "Failed to update task status");
    }
  };

  const handleAssign = async (taskId, userId) => {
    setError(null);

    // Find user for optimistic update
    const member = members.find((m) => m.userId === userId);
    const assigneeName = member?.user?.name || null;

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, assigneeId: userId, assignedToUserId: userId, assigneeName }
          : t
      )
    );

    try {
      const { data, error } = await tasksApi.assign(taskId, userId);
      if (error) throw new Error(error);

      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? data : t))
      );
      toast.success("Task assignee updated");
    } catch (err) {
      fetchTasks();
      setError(err.message);
      toast.error(err.message || "Failed to assign task");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingTask) return;

    setFormLoading(true);
    setError(null);

    try {
      const { error } = await tasksApi.delete(deletingTask.id);
      if (error) throw new Error(error);

      setTasks((prev) => prev.filter((t) => t.id !== deletingTask.id));
      setIsDeleteOpen(false);
      setDeletingTask(null);
      toast.success("Task deleted successfully");
    } catch (err) {
      setError(err.message);
      toast.error(err.message || "Failed to delete task");
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Tasks</h1>
          <p className="text-text-secondary mt-1">
            Manage tasks for {project?.name}
          </p>
        </div>
        {canCreate && (
          <Button
            onClick={handleCreate}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add Task
          </Button>
        )}
      </div>

      {/* Error */}
      {error && (
        <Alert variant="error" message={error} onDismiss={() => setError(null)} />
      )}

      {/* Filters & View Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
          {[
            { key: "all", label: "All", icon: ListTodo },
            { key: "todo", label: "To Do", icon: AlertCircle },
            { key: "in_progress", label: "In Progress", icon: Clock },
            { key: "done", label: "Done", icon: CheckCircle2 },
            { key: "rejected", label: "Rejected", icon: XCircle },
            { key: "support", label: "Support", icon: HelpCircle },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setStatusFilter(key)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                statusFilter === key
                  ? "bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30"
                  : "bg-brand-dark/5 dark:bg-white/5 text-text-secondary border border-brand-border hover:bg-brand-dark/10 dark:hover:bg-white/10"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
              <span className="ml-1 text-xs opacity-70">({taskCounts[key] || taskCounts.done})</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 p-1 bg-brand-dark/5 dark:bg-white/5 rounded-lg">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className={showFilters || filters.q || filters.assignee !== "all" || filters.priority !== "all" ? "text-brand" : "text-text-secondary"}
            leftIcon={<Search className="w-4 h-4" />}
          >
            Filter
          </Button>
          <div className="w-px h-4 bg-brand-border mx-1"></div>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded transition-colors ${
              viewMode === "list"
                ? "bg-brand-dark/10 dark:bg-white/10 text-text-primary"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded transition-colors ${
              viewMode === "grid"
                ? "bg-brand-dark/10 dark:bg-white/10 text-text-primary"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="bg-brand-dark/10 dark:bg-white/5 border border-brand-border rounded-xl p-4 animate-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Keyword Search */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-text-secondary ml-1">Title or Description</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary/50" />
                <input
                  type="text"
                  placeholder="Filter tasks..."
                  value={filters.q}
                  onChange={(e) => setFilters(prev => ({ ...prev, q: e.target.value }))}
                  className="w-full pl-9 pr-3 py-2 bg-brand-light border border-brand-border rounded-lg text-sm outline-none focus:border-brand transition-colors"
                />
              </div>
            </div>

            {/* Assignee Filter */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-text-secondary ml-1">Assignee</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary/50" />
                <select
                  value={filters.assignee}
                  onChange={(e) => setFilters(prev => ({ ...prev, assignee: e.target.value }))}
                  className="w-full pl-9 pr-3 py-2 bg-brand-light border border-brand-border rounded-lg text-sm outline-none focus:border-brand transition-colors appearance-none"
                >
                  <option value="all">Any Assignee</option>
                  {members.map(m => (
                    <option key={m.userId} value={m.userId}>{m.user?.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Priority Filter */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-text-secondary ml-1">Priority</label>
              <div className="relative">
                <AlertCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary/50" />
                <select
                  value={filters.priority}
                  onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                  className="w-full pl-9 pr-3 py-2 bg-brand-light border border-brand-border rounded-lg text-sm outline-none focus:border-brand transition-colors appearance-none"
                >
                  <option value="all">Any Priority</option>
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>
          </div>
          
          {(filters.q || filters.assignee !== "all" || filters.priority !== "all") && (
            <div className="flex justify-end mt-3">
              <button 
                onClick={() => setFilters({ q: "", assignee: "all", priority: "all" })}
                className="text-xs text-brand hover:underline flex items-center gap-1"
              >
                <X className="w-3 h-3" /> Clear filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tasks */}
      {tasksLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <TaskItemSkeleton key={i} />
          ))}
        </div>
      ) : filteredTasks.length === 0 ? (
        <EmptyState
          icon={ListTodo}
          title={statusFilter !== "all" ? `No ${statusFilter.replace("_", " ")} tasks` : "No tasks yet"}
          description={
            statusFilter !== "all"
              ? "Try selecting a different filter"
              : "Create your first task to get started"
          }
          actionLabel={statusFilter === "all" && canCreate ? "Add Task" : undefined}
          onAction={statusFilter === "all" && canCreate ? handleCreate : undefined}
        />
      ) : viewMode === "list" ? (
        <div className="space-y-3">
          {filteredTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              members={members}
              currentUserId={currentUser?.id}
              userRole={userRole}
              onStatusChange={canUpdateTaskStatus(userRole, task, currentUser?.id) ? handleStatusChange : undefined}
              onEdit={canEditAny ? handleEdit : undefined}
              onDelete={canDelete ? handleDeleteClick : undefined}
              onAssign={canAssign ? handleAssign : undefined}
              onClick={() => navigate(`/projects/${projectId}/tasks/${task.id}`, { state: { from: `/projects/${projectId}/tasks` } })}
            />
          ))}
        </div>
      ) : (
        // Grid view
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              members={members}
              currentUserId={currentUser?.id}
              userRole={userRole}
              onStatusChange={canUpdateTaskStatus(userRole, task, currentUser?.id) ? handleStatusChange : undefined}
              onEdit={canEditAny ? handleEdit : undefined}
              onDelete={canDelete ? handleDeleteClick : undefined}
              onAssign={canAssign ? handleAssign : undefined}
              onClick={() => navigate(`/projects/${projectId}/tasks/${task.id}`, { state: { from: `/projects/${projectId}/tasks` } })}
              compact
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <TaskFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingTask(null);
          setFormError(null);
        }}
        onSubmit={handleFormSubmit}
        task={editingTask}
        members={members}
        loading={formLoading}
        errorMessage={formError}
      />

      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setDeletingTask(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Task"
        message={`Are you sure you want to delete "${deletingTask?.title}"? This action cannot be undone.`}
        confirmLabel="Delete Task"
        variant="danger"
        isLoading={formLoading}
      />

      {/* Task Detail Panel (rendered via Outlet) */}
      <Outlet />
    </div>
  );
};

export default ProjectTasks;
