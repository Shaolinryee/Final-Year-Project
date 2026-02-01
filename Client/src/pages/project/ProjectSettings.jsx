/**
 * ProjectSettings - Project settings page
 * Only accessible by project Owner
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Settings,
  Trash2,
  AlertTriangle,
  Archive,
  Download,
  ShieldAlert,
} from "lucide-react";
import { useProject } from "./ProjectLayout";
import { projectsApi } from "../../services/api";
import { Button, Alert, ConfirmDialog } from "../../components/ui";
import { ProjectFormModal } from "../../components/projects";
import { canViewSettings, canDeleteProject } from "../../utils/permissions";

const ProjectSettings = () => {
  const navigate = useNavigate();
  const {
    project,
    isOwner,
    userRole,
    setProject,
  } = useProject();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [error, setError] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  // Permission checks
  const canAccessSettings = canViewSettings(userRole);
  const canDelete = canDeleteProject(userRole);

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

  // Unauthorized view for non-owners
  if (!canAccessSettings) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Settings</h1>
          <p className="text-text-secondary mt-1">Project settings for {project?.name}</p>
        </div>

        <div className="p-8 rounded-xl bg-brand-light border border-brand-border text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-500/10 flex items-center justify-center">
            <ShieldAlert className="w-8 h-8 text-amber-500" />
          </div>
          <h3 className="text-lg font-semibold text-text-primary mb-2">Owner Access Required</h3>
          <p className="text-text-secondary max-w-md mx-auto">
            Only the project owner can access and modify project settings. 
            Contact the project owner if you need changes made.
          </p>
          <Button 
            variant="outline" 
            className="mt-6"
            onClick={() => navigate(`/projects/${project?.id}/overview`)}
          >
            Back to Overview
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Settings</h1>
        <p className="text-text-secondary mt-1">Manage settings for {project?.name}</p>
      </div>

      {/* Error */}
      {error && (
        <Alert variant="error" message={error} onDismiss={() => setError(null)} />
      )}

      {/* General Settings */}
      <div className="rounded-xl bg-brand-light border border-brand-border">
        <div className="px-6 py-4 border-b border-brand-border">
          <h2 className="font-semibold text-text-primary">General</h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-text-primary">Project Details</p>
              <p className="text-sm text-text-secondary">Update project name, description, and key</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditOpen(true)}
            >
              Edit Project
            </Button>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="rounded-xl bg-brand-light border border-brand-border">
        <div className="px-6 py-4 border-b border-brand-border">
          <h2 className="font-semibold text-text-primary">Data Management</h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-text-primary">Export Project</p>
              <p className="text-sm text-text-secondary">Download all project data as JSON</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Download className="w-4 h-4" />}
              disabled
            >
              Export
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-text-primary">Archive Project</p>
              <p className="text-sm text-text-secondary">Archive this project and hide from view</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Archive className="w-4 h-4" />}
              disabled
            >
              Archive
            </Button>
          </div>
        </div>
      </div>

      {/* Danger Zone - Only show if user can delete */}
      {canDelete && (
        <div className="rounded-xl bg-rose-500/5 border border-rose-500/20">
          <div className="px-6 py-4 border-b border-rose-500/20">
            <h2 className="font-semibold text-rose-500 dark:text-rose-400 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Danger Zone
            </h2>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-text-primary">Delete Project</p>
                <p className="text-sm text-text-secondary">
                  Permanently delete this project and all its data. This cannot be undone.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsDeleteOpen(true)}
                className="border-rose-500/30 text-rose-500 hover:bg-rose-500/10"
                leftIcon={<Trash2 className="w-4 h-4" />}
              >
                Delete
              </Button>
            </div>
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

export default ProjectSettings;
