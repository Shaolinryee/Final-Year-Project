/**
 * ProjectTasks - Tasks management page for a project
 */

import { useState, useMemo } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import {
  Plus,
  ListTodo,
  Clock,
  CheckCircle2,
  AlertCircle,
  LayoutGrid,
  List,
} from "lucide-react";
import { useProject } from "./ProjectLayout";
import { tasksApi } from "../../services/api";
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

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingTask, setDeletingTask] = useState(null);
  const [error, setError] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    if (statusFilter === "all") return tasks;

    return tasks.filter((task) => {
      const taskStatus = task.status?.toLowerCase().replace("-", "_") || "todo";
      return taskStatus === statusFilter;
    });
  }, [tasks, statusFilter]);

  // Task counts
  const taskCounts = useMemo(() => {
    return {
      all: tasks.length,
      todo: tasks.filter((t) => t.status?.toUpperCase() === "TODO").length,
      in_progress: tasks.filter((t) => t.status?.toUpperCase() === "IN_PROGRESS").length,
      done: tasks.filter((t) => {
        const s = t.status?.toUpperCase();
        return s === "COMPLETED" || s === "DONE";
      }).length,
    };
  }, [tasks]);

  // Handlers
  const handleCreate = () => {
    setEditingTask(null);
    setIsFormOpen(true);
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (task) => {
    setDeletingTask(task);
    setIsDeleteOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    setFormLoading(true);
    setError(null);

    try {
      if (editingTask) {
        const { data, error } = await tasksApi.update(editingTask.id, formData);
        if (error) throw new Error(error);

        setTasks((prev) =>
          prev.map((t) => (t.id === editingTask.id ? data : t))
        );
      } else {
        const { data, error } = await tasksApi.create(projectId, formData);
        if (error) throw new Error(error);

        setTasks((prev) => [...prev, data]);
      }

      setIsFormOpen(false);
      setEditingTask(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    setError(null);

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, status: newStatus.toUpperCase() } : t
      )
    );

    try {
      const { error } = await tasksApi.updateStatus(taskId, newStatus.toUpperCase());
      if (error) throw new Error(error);
    } catch (err) {
      fetchTasks();
      setError(err.message);
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
          ? { ...t, assignedToUserId: userId, assigneeName }
          : t
      )
    );

    try {
      const { data, error } = await tasksApi.assign(taskId, userId);
      if (error) throw new Error(error);

      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? data : t))
      );
    } catch (err) {
      fetchTasks();
      setError(err.message);
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
    } catch (err) {
      setError(err.message);
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
              onClick={() => navigate(`/projects/${projectId}/tasks/${task.id}`)}
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
              onClick={() => navigate(`/projects/${projectId}/tasks/${task.id}`)}
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
        }}
        onSubmit={handleFormSubmit}
        task={editingTask}
        members={members}
        isLoading={formLoading}
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
