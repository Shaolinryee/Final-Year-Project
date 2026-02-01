/**
 * ProjectSettings - Project settings page
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Settings,
  Trash2,
  AlertTriangle,
  Archive,
  Download,
} from "lucide-react";
import { useProject } from "./ProjectLayout";
import { projectsApi } from "../../services/api";
import { Button, Alert, ConfirmDialog } from "../../components/ui";
import { ProjectFormModal } from "../../components/projects";

const ProjectSettings = () => {
  const navigate = useNavigate();
  const {
    project,
    isOwner,
    setProject,
  } = useProject();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [error, setError] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

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

  if (!isOwner) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <p className="text-gray-400 mt-1">Project settings for {project?.name}</p>
        </div>

        <div className="p-6 rounded-xl bg-white/5 border border-white/10 text-center">
          <Settings className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">Owner Access Required</h3>
          <p className="text-gray-400">
            You need to be the project owner to access settings.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-gray-400 mt-1">Manage settings for {project?.name}</p>
      </div>

      {/* Error */}
      {error && (
        <Alert variant="error" message={error} onDismiss={() => setError(null)} />
      )}

      {/* General Settings */}
      <div className="rounded-xl bg-white/5 border border-white/10">
        <div className="px-6 py-4 border-b border-white/10">
          <h2 className="font-semibold text-white">General</h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-white">Project Details</p>
              <p className="text-sm text-gray-400">Update project name, description, and key</p>
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
      <div className="rounded-xl bg-white/5 border border-white/10">
        <div className="px-6 py-4 border-b border-white/10">
          <h2 className="font-semibold text-white">Data Management</h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-white">Export Project</p>
              <p className="text-sm text-gray-400">Download all project data as JSON</p>
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
              <p className="font-medium text-white">Archive Project</p>
              <p className="text-sm text-gray-400">Archive this project and hide from view</p>
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

      {/* Danger Zone */}
      <div className="rounded-xl bg-rose-500/5 border border-rose-500/20">
        <div className="px-6 py-4 border-b border-rose-500/20">
          <h2 className="font-semibold text-rose-400 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Danger Zone
          </h2>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-white">Delete Project</p>
              <p className="text-sm text-gray-400">
                Permanently delete this project and all its data. This cannot be undone.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDeleteOpen(true)}
              className="border-rose-500/30 text-rose-400 hover:bg-rose-500/10"
              leftIcon={<Trash2 className="w-4 h-4" />}
            >
              Delete
            </Button>
          </div>
        </div>
      </div>

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
