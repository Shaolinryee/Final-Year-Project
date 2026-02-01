/**
 * Projects Page
 * Lists all projects with CRUD operations
 */

import { useState, useEffect, useMemo } from "react";
import { Plus, Search, FolderKanban, Filter } from "lucide-react";
import { projectsApi } from "../services/api";
import {
  Button,
  Input,
  Alert,
  EmptyState,
  ConfirmDialog,
  ProjectCardSkeleton,
} from "../components/ui";
import { ProjectCard, ProjectFormModal } from "../components/projects";

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all, active, archived

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingProject, setDeletingProject] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await projectsApi.getAll();

    if (fetchError) {
      setError(fetchError);
    } else {
      setProjects(data || []);
    }

    setLoading(false);
  };

  // Filtered projects
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      // Search filter
      const matchesSearch =
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.key.toLowerCase().includes(searchQuery.toLowerCase());

      // Status filter
      const matchesStatus =
        statusFilter === "all" || project.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [projects, searchQuery, statusFilter]);

  // Handlers
  const handleCreateProject = () => {
    setEditingProject(null);
    setIsFormModalOpen(true);
  };

  const handleEditProject = (project) => {
    setEditingProject(project);
    setIsFormModalOpen(true);
  };

  const handleDeleteClick = (project) => {
    setDeletingProject(project);
    setIsDeleteDialogOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    setFormLoading(true);
    setError(null);

    try {
      if (editingProject) {
        // Update existing project
        const { data, error: updateError } = await projectsApi.update(
          editingProject.id,
          formData
        );
        if (updateError) throw new Error(updateError);

        setProjects((prev) =>
          prev.map((p) => (p.id === editingProject.id ? data : p))
        );
      } else {
        // Create new project
        const { data, error: createError } = await projectsApi.create(formData);
        if (createError) throw new Error(createError);

        setProjects((prev) => [...prev, data]);
      }

      setIsFormModalOpen(false);
      setEditingProject(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingProject) return;

    setFormLoading(true);
    setError(null);

    try {
      const { error: deleteError } = await projectsApi.delete(deletingProject.id);
      if (deleteError) throw new Error(deleteError);

      setProjects((prev) => prev.filter((p) => p.id !== deletingProject.id));
      setIsDeleteDialogOpen(false);
      setDeletingProject(null);
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
          <h1 className="text-2xl font-bold text-text-primary">
            Projects
          </h1>
          <p className="text-text-secondary mt-1">
            Manage and organize your projects
          </p>
        </div>
        <Button onClick={handleCreateProject} leftIcon={<Plus className="w-4 h-4" />}>
          Create Project
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert
          variant="error"
          title="Error"
          message={error}
          onDismiss={() => setError(null)}
        />
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-text-secondary" />
          <div className="flex rounded-lg border border-brand-border overflow-hidden">
            {["all", "active", "archived"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  statusFilter === status
                    ? "bg-brand text-white"
                    : "bg-brand-light text-text-secondary hover:bg-brand-dark/30"
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <ProjectCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredProjects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title={searchQuery || statusFilter !== "all" ? "No projects found" : "No projects yet"}
          description={
            searchQuery || statusFilter !== "all"
              ? "Try adjusting your search or filters"
              : "Create your first project to get started"
          }
          actionLabel={!searchQuery && statusFilter === "all" ? "Create Project" : undefined}
          onAction={!searchQuery && statusFilter === "all" ? handleCreateProject : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onEdit={handleEditProject}
              onDelete={handleDeleteClick}
            />
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <ProjectFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingProject(null);
        }}
        onSubmit={handleFormSubmit}
        project={editingProject}
        loading={formLoading}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setDeletingProject(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Project"
        message={`Are you sure you want to delete "${deletingProject?.name}"? This will also delete all tasks in this project. This action cannot be undone.`}
        confirmText="Delete"
        loading={formLoading}
      />
    </div>
  );
};

export default Projects;
