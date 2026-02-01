/**
 * ProjectCard Component
 * Displays a project in the list view
 */

import { useNavigate } from "react-router-dom";
import { FolderKanban, Calendar, Edit2, Trash2, Eye } from "lucide-react";
import { Button, StatusPill } from "../ui";

const ProjectCard = ({ project, onEdit, onDelete }) => {
  const navigate = useNavigate();

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="rounded-xl border border-brand-border bg-brand-light shadow-sm hover:shadow-md transition-shadow">
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
              <FolderKanban className="w-6 h-6 text-brand" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-text-primary">
                  {project.name}
                </h3>
                <span className="text-xs font-mono text-text-secondary bg-brand-dark/20 dark:bg-white/10 px-2 py-0.5 rounded">
                  {project.key}
                </span>
              </div>
            </div>
          </div>
          <StatusPill status={project.status || "active"} />
        </div>

        {/* Description */}
        <p className="text-sm text-text-secondary line-clamp-2 mb-4 min-h-[40px]">
          {project.description || "No description"}
        </p>

        {/* Meta */}
        <div className="flex items-center text-xs text-text-secondary mb-4">
          <Calendar className="w-3.5 h-3.5 mr-1" />
          Created {formatDate(project.createdAt)}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-4 border-t border-brand-border">
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate(`/projects/${project.id}`)}
            leftIcon={<Eye className="w-4 h-4" />}
          >
            View
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(project)}
            leftIcon={<Edit2 className="w-4 h-4" />}
          >
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(project)}
            className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-900/20"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
