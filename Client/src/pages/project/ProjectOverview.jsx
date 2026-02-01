/**
 * ProjectOverview - Main overview page for a project
 * Shows project details, stats, and quick actions
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Edit2,
  Trash2,
  ListTodo,
  Clock,
  CheckCircle2,
  Users,
  Activity,
  Plus,
  ArrowRight,
  Calendar,
} from "lucide-react";
import { useProject } from "./ProjectLayout";
import { projectsApi } from "../../services/api";
import {
  Button,
  Alert,
  ConfirmDialog,
  StatusPill,
} from "../../components/ui";
import { ProjectFormModal } from "../../components/projects";

const ProjectOverview = () => {
  const navigate = useNavigate();
  const {
    project,
    tasks,
    members,
    activities,
    isOwner,
    tasksLoading,
    setProject,
    fetchProject,
  } = useProject();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [error, setError] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  // Stats
  const taskCounts = {
    total: tasks.length,
    todo: tasks.filter((t) => t.status?.toUpperCase() === "TODO").length,
    inProgress: tasks.filter((t) => t.status?.toUpperCase() === "IN_PROGRESS").length,
    done: tasks.filter((t) => ["DONE", "COMPLETED"].includes(t.status?.toUpperCase())).length,
  };

  const completionPercent = taskCounts.total > 0
    ? Math.round((taskCounts.done / taskCounts.total) * 100)
    : 0;

  // Handlers
  const handleUpdate = async (formData) => {
    setFormLoading(true);
    setError(null);

    try {
      const { data, error } = await projectsApi.update(project.id, formData);
      if (error) throw new Error(error);

      setProject(data);
      setIsEditOpen(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    setFormLoading(true);

    try {
      const { error } = await projectsApi.delete(project.id);
      if (error) throw new Error(error);

      navigate("/projects");
    } catch (err) {
      setError(err.message);
      setIsDeleteOpen(false);
    } finally {
      setFormLoading(false);
    }
  };

  // Recent activities (latest 5)
  const recentActivities = activities.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="px-2 py-1 rounded bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-sm font-mono">
              {project.key}
            </span>
            <StatusPill status={project.status || "active"} />
          </div>
          <h1 className="text-2xl font-bold text-text-primary">{project.name}</h1>
          {project.description && (
            <p className="text-text-secondary mt-2 max-w-2xl">{project.description}</p>
          )}
        </div>

        {isOwner && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditOpen(true)}
              leftIcon={<Edit2 className="w-4 h-4" />}
            >
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsDeleteOpen(true)}
              className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <Alert variant="error" message={error} onDismiss={() => setError(null)} />
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-brand-light border border-brand-border">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-indigo-500/20">
              <ListTodo className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">{taskCounts.total}</p>
              <p className="text-sm text-text-secondary">Total Tasks</p>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-brand-light border border-brand-border">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-amber-500/20">
              <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">{taskCounts.inProgress}</p>
              <p className="text-sm text-text-secondary">In Progress</p>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-brand-light border border-brand-border">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-emerald-500/20">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">{completionPercent}%</p>
              <p className="text-sm text-text-secondary">Complete</p>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-brand-light border border-brand-border">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-purple-500/20">
              <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">{members.length}</p>
              <p className="text-sm text-text-secondary">Members</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="p-5 rounded-xl bg-brand-light border border-brand-border">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-text-primary">Progress</h3>
          <span className="text-sm text-text-secondary">
            {taskCounts.done} of {taskCounts.total} tasks completed
          </span>
        </div>
        <div className="h-3 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
            style={{ width: `${completionPercent}%` }}
          />
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={() => navigate(`/projects/${project.id}/tasks`)}
          className="flex items-center justify-between p-4 rounded-xl bg-brand-light border border-brand-border hover:bg-brand-dark/10 dark:hover:bg-white/10 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <ListTodo className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span className="font-medium text-text-primary">View Tasks</span>
          </div>
          <ArrowRight className="w-5 h-5 text-text-secondary group-hover:text-text-primary transition-colors" />
        </button>

        <button
          onClick={() => navigate(`/projects/${project.id}/members`)}
          className="flex items-center justify-between p-4 rounded-xl bg-brand-light border border-brand-border hover:bg-brand-dark/10 dark:hover:bg-white/10 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <span className="font-medium text-text-primary">Team Members</span>
          </div>
          <ArrowRight className="w-5 h-5 text-text-secondary group-hover:text-text-primary transition-colors" />
        </button>

        <button
          onClick={() => navigate(`/projects/${project.id}/activity`)}
          className="flex items-center justify-between p-4 rounded-xl bg-brand-light border border-brand-border hover:bg-brand-dark/10 dark:hover:bg-white/10 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <Activity className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span className="font-medium text-text-primary">Activity Log</span>
          </div>
          <ArrowRight className="w-5 h-5 text-text-secondary group-hover:text-text-primary transition-colors" />
        </button>
      </div>

      {/* Recent Activity */}
      {recentActivities.length > 0 && (
        <div className="rounded-xl bg-brand-light border border-brand-border">
          <div className="px-5 py-4 border-b border-brand-border flex items-center justify-between">
            <h3 className="font-semibold text-text-primary">Recent Activity</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/projects/${project.id}/activity`)}
            >
              View All
            </Button>
          </div>
          <div className="divide-y divide-brand-border">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="px-5 py-3">
                <p className="text-sm text-text-primary">{activity.message}</p>
                <p className="text-xs text-text-secondary mt-1">
                  {new Date(activity.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      <ProjectFormModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSubmit={handleUpdate}
        project={project}
        isLoading={formLoading}
      />

      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Project"
        message="Are you sure you want to delete this project? This action cannot be undone and all tasks, members, and activity will be permanently removed."
        confirmLabel="Delete Project"
        variant="danger"
        isLoading={formLoading}
      />
    </div>
  );
};

export default ProjectOverview;
