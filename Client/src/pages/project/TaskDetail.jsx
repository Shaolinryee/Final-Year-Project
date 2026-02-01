/**
 * TaskDetail - Jira-style task detail panel
 * Opens as a slide-in panel from the right side
 */

import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  X,
  Edit2,
  Trash2,
  Calendar,
  Clock,
  User,
  FolderKanban,
  CheckCircle2,
  Circle,
  AlertCircle,
  ChevronDown,
  MessageSquare,
  History,
  Paperclip,
  Save,
  MoreHorizontal,
  Send,
  Image,
  Video,
  FileText,
  Upload,
  Play,
} from "lucide-react";
import { getCurrentUserId, getUsersStore } from "../../services/mock/users.mock";
import { useProject } from "./ProjectLayout";
import { tasksApi } from "../../services/api";
import { Button, Alert, StatusPill, ConfirmDialog } from "../../components/ui";
import { TaskFormModal } from "../../components/tasks";
import { ActivityFeed } from "../../components/activity";

const statusConfig = {
  todo: {
    icon: Circle,
    label: "To Do",
    color: "text-slate-400",
    bgColor: "bg-slate-500/20",
  },
  in_progress: {
    icon: Clock,
    label: "In Progress",
    color: "text-blue-400",
    bgColor: "bg-blue-500/20",
  },
  completed: {
    icon: CheckCircle2,
    label: "Done",
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/20",
  },
  done: {
    icon: CheckCircle2,
    label: "Done",
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/20",
  },
};

const priorityConfig = {
  low: { label: "Low", color: "text-gray-400", bgColor: "bg-gray-500/20" },
  medium: { label: "Medium", color: "text-amber-400", bgColor: "bg-amber-500/20" },
  high: { label: "High", color: "text-rose-400", bgColor: "bg-rose-500/20" },
};

const TaskDetail = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const {
    project,
    tasks,
    members,
    activities,
    setTasks,
    fetchTasks,
    projectId,
  } = useProject();

  // Find task from context
  const task = tasks.find((t) => t.id === taskId);

  // Local state
  const [loading, setLoading] = useState(!task);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("comments");
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showAssignMenu, setShowAssignMenu] = useState(false);
  const [showPriorityMenu, setShowPriorityMenu] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedDescription, setEditedDescription] = useState("");

  // Comments state
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [commentSubmitting, setCommentSubmitting] = useState(false);

  // Attachments state
  const [attachments, setAttachments] = useState([]);
  const fileInputRef = useRef(null);
  const [previewAttachment, setPreviewAttachment] = useState(null);

  // Get current user info
  const currentUserId = getCurrentUserId();
  const users = getUsersStore();
  const currentUser = users.find((u) => u.id === currentUserId) || {
    id: currentUserId,
    name: "Current User",
    avatarUrl: null,
  };

  // Cleanup object URLs when component unmounts or attachments change
  useEffect(() => {
    return () => {
      attachments.forEach((att) => {
        if (att.previewUrl) {
          URL.revokeObjectURL(att.previewUrl);
        }
      });
    };
  }, []);

  // Load comments and attachments when task changes (mock - in real app these would be API calls)
  useEffect(() => {
    if (task) {
      // Reset comments and attachments when task changes
      setComments([]);
      setAttachments([]);
    }
  }, [taskId]);

  // If task is not in context, fetch it
  useEffect(() => {
    if (!task && taskId) {
      const fetchTask = async () => {
        setLoading(true);
        const { data, error } = await tasksApi.getById(taskId);
        if (error || !data) {
          setError("Task not found");
        } else {
          // Add to tasks context
          setTasks((prev) => {
            if (prev.find((t) => t.id === taskId)) return prev;
            return [...prev, data];
          });
        }
        setLoading(false);
      };
      fetchTask();
    }
  }, [taskId, task, setTasks]);

  // Initialize edit state when task loads
  useEffect(() => {
    if (task) {
      setEditedTitle(task.title || "");
      setEditedDescription(task.description || "");
    }
  }, [task]);

  const handleClose = () => {
    navigate(`/projects/${projectId}/tasks`);
  };

  const handleStatusChange = async (newStatus) => {
    setShowStatusMenu(false);
    if (!task || newStatus === task.status?.toLowerCase()) return;

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

  const handleAssignChange = async (userId) => {
    setShowAssignMenu(false);
    if (!task) return;

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
      const { error } = await tasksApi.assign(taskId, userId);
      if (error) throw new Error(error);
    } catch (err) {
      fetchTasks();
      setError(err.message);
    }
  };

  const handlePriorityChange = async (newPriority) => {
    setShowPriorityMenu(false);
    if (!task || newPriority === task.priority) return;

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, priority: newPriority } : t
      )
    );

    try {
      const { error } = await tasksApi.update(taskId, { priority: newPriority });
      if (error) throw new Error(error);
    } catch (err) {
      fetchTasks();
      setError(err.message);
    }
  };

  const handleSaveInline = async () => {
    if (!task) return;
    
    setFormLoading(true);
    try {
      const { data, error } = await tasksApi.update(taskId, {
        title: editedTitle,
        description: editedDescription,
      });
      if (error) throw new Error(error);
      
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? data : t))
      );
      setIsEditing(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    setFormLoading(true);
    try {
      const { error } = await tasksApi.delete(taskId);
      if (error) throw new Error(error);

      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      navigate(`/projects/${projectId}/tasks`);
    } catch (err) {
      setError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditSubmit = async (formData) => {
    setFormLoading(true);
    try {
      const { data, error } = await tasksApi.update(taskId, formData);
      if (error) throw new Error(error);

      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? data : t))
      );
      setIsEditOpen(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  // ==================== COMMENTS HANDLERS ====================
  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    setCommentSubmitting(true);
    
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300));
    
    const comment = {
      id: `comment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      taskId,
      projectId,
      authorUserId: currentUser.id,
      authorName: currentUser.name,
      authorAvatarUrl: currentUser.avatarUrl,
      content: newComment.trim(),
      createdAt: new Date().toISOString(),
    };

    setComments((prev) => [comment, ...prev]);
    setNewComment("");
    setCommentSubmitting(false);
  };

  const handleDeleteComment = (commentId) => {
    setComments((prev) => prev.filter((c) => c.id !== commentId));
  };

  const formatCommentTime = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  // ==================== ATTACHMENTS HANDLERS ====================
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const newAttachments = files.map((file) => {
      const isImage = file.type.startsWith("image/");
      const isVideo = file.type.startsWith("video/");
      
      return {
        id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        taskId,
        projectId,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        previewUrl: isImage || isVideo ? URL.createObjectURL(file) : null,
        isImage,
        isVideo,
        createdAt: new Date().toISOString(),
      };
    });

    setAttachments((prev) => [...prev, ...newAttachments]);
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveAttachment = (attachmentId) => {
    const attachment = attachments.find((a) => a.id === attachmentId);
    if (attachment?.previewUrl) {
      URL.revokeObjectURL(attachment.previewUrl);
    }
    setAttachments((prev) => prev.filter((a) => a.id !== attachmentId));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (fileType) => {
    if (fileType.startsWith("image/")) return Image;
    if (fileType.startsWith("video/")) return Video;
    return FileText;
  };

  // Helper functions
  const getInitials = (name) => {
    if (!name) return "?";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const formatDate = (date) => {
    if (!date) return "Not set";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getTaskKey = () => {
    const index = tasks.findIndex((t) => t.id === taskId);
    return `${project?.key || "TASK"}-${index + 1}`;
  };

  const getAssignee = () => {
    if (!task?.assignedToUserId) return null;
    const member = members.find((m) => m.userId === task.assignedToUserId);
    return member?.user || { name: task.assigneeName || "Unknown" };
  };

  const status = task?.status?.toLowerCase().replace("-", "_") || "todo";
  const statusCfg = statusConfig[status] || statusConfig.todo;
  const StatusIcon = statusCfg.icon;
  const assignee = getAssignee();
  const priorityCfg = priorityConfig[task?.priority?.toLowerCase()] || priorityConfig.medium;

  // Filter activities for this task
  const taskActivities = activities.filter(
    (a) => a.entityType === "task" && a.entityId === taskId
  );

  // Loading state
  if (loading) {
    return (
      <div className="fixed inset-y-0 right-0 w-full max-w-2xl bg-brand-light border-l border-brand-border shadow-2xl z-50 animate-slide-in-right transition-colors duration-300">
        <div className="h-full flex flex-col">
          <div className="h-14 border-b border-brand-border px-6 flex items-center">
            <div className="h-6 w-48 bg-brand-dark/50 rounded animate-pulse" />
          </div>
          <div className="flex-1 p-6 space-y-6">
            <div className="h-8 w-64 bg-brand-dark/50 rounded animate-pulse" />
            <div className="h-24 w-full bg-brand-dark/50 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  // Error / Not found state
  if (error || !task) {
    return (
      <div className="fixed inset-y-0 right-0 w-full max-w-2xl bg-brand-light border-l border-brand-border shadow-2xl z-50 transition-colors duration-300">
        <div className="h-full flex flex-col">
          <div className="h-14 border-b border-brand-border px-6 flex items-center justify-between">
            <span className="text-text-secondary">Task not found</span>
            <button
              onClick={handleClose}
              className="p-2 rounded-lg hover:bg-brand-dark/30 text-text-secondary hover:text-text-primary transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-text-secondary mx-auto mb-4" />
              <h3 className="text-lg font-medium text-text-primary mb-2">Task not found</h3>
              <p className="text-text-secondary mb-4">The task you're looking for doesn't exist.</p>
              <Button onClick={handleClose}>Back to Tasks</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={handleClose}
      />

      {/* Panel */}
      <div className="fixed inset-y-0 right-0 w-full max-w-2xl bg-brand-light border-l border-brand-border shadow-2xl z-50 flex flex-col animate-slide-in-right transition-colors duration-300">
        {/* Header */}
        <div className="h-14 border-b border-brand-border px-6 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="px-2 py-1 rounded bg-brand/20 text-brand text-xs font-mono">
              {getTaskKey()}
            </span>
            <span className="text-sm text-text-secondary">{project?.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditOpen(true)}
              className="p-2 rounded-lg hover:bg-brand-dark/30 text-text-secondary hover:text-text-primary transition-colors"
              title="Edit task"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsDeleteOpen(true)}
              className="p-2 rounded-lg hover:bg-rose-500/10 text-text-secondary hover:text-rose-400 transition-colors"
              title="Delete task"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleClose}
              className="p-2 rounded-lg hover:bg-brand-dark/30 text-text-secondary hover:text-text-primary transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="flex">
            {/* Main Content */}
            <div className="flex-1 p-6 border-r border-brand-border">
              {/* Error Alert */}
              {error && (
                <Alert
                  variant="error"
                  message={error}
                  onDismiss={() => setError(null)}
                  className="mb-4"
                />
              )}

              {/* Title */}
              <div className="mb-6">
                {isEditing ? (
                  <input
                    type="text"
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    className="w-full text-xl font-semibold text-text-primary bg-brand-dark/30 border border-brand-border rounded-lg px-3 py-2 focus:outline-none focus:border-brand"
                    autoFocus
                  />
                ) : (
                  <h1
                    className="text-xl font-semibold text-text-primary cursor-pointer hover:text-brand transition-colors"
                    onClick={() => setIsEditing(true)}
                    title="Click to edit"
                  >
                    {task.title}
                  </h1>
                )}
              </div>

              {/* Status Row */}
              <div className="flex items-center gap-4 mb-6">
                {/* Status Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowStatusMenu(!showStatusMenu)}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${statusCfg.bgColor} ${statusCfg.color}`}
                  >
                    <StatusIcon className="w-4 h-4" />
                    {statusCfg.label}
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  {showStatusMenu && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowStatusMenu(false)} />
                      <div className="absolute left-0 top-full mt-1 w-40 bg-brand-light rounded-lg shadow-lg border border-brand-border py-1 z-20">
                        {Object.entries(statusConfig).map(([key, cfg]) => {
                          if (key === "done") return null; // Skip duplicate
                          const Icon = cfg.icon;
                          return (
                            <button
                              key={key}
                              onClick={() => handleStatusChange(key)}
                              className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-brand-dark/30 ${
                                key === status ? "bg-brand-dark/30" : ""
                              }`}
                            >
                              <Icon className={`w-4 h-4 ${cfg.color}`} />
                              <span className="text-text-primary">{cfg.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>

                {/* Priority Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowPriorityMenu(!showPriorityMenu)}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${priorityCfg.bgColor} ${priorityCfg.color}`}
                  >
                    {priorityCfg.label}
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  {showPriorityMenu && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowPriorityMenu(false)} />
                      <div className="absolute left-0 top-full mt-1 w-32 bg-brand-light rounded-lg shadow-lg border border-brand-border py-1 z-20">
                        {Object.entries(priorityConfig).map(([key, cfg]) => (
                          <button
                            key={key}
                            onClick={() => handlePriorityChange(key)}
                            className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-brand-dark/30 ${
                              key === task.priority?.toLowerCase() ? "bg-brand-dark/30" : ""
                            }`}
                          >
                            <span className={cfg.color}>{cfg.label}</span>
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-text-secondary mb-2">Description</h3>
                {isEditing ? (
                  <textarea
                    value={editedDescription}
                    onChange={(e) => setEditedDescription(e.target.value)}
                    rows={4}
                    className="w-full text-text-primary bg-brand-dark/30 border border-brand-border rounded-lg px-3 py-2 focus:outline-none focus:border-brand resize-none"
                    placeholder="Add a description..."
                  />
                ) : (
                  <div
                    className="text-text-primary bg-brand-dark/30 rounded-lg p-4 min-h-[100px] cursor-pointer hover:bg-brand-dark/50 transition-colors"
                    onClick={() => setIsEditing(true)}
                  >
                    {task.description || (
                      <span className="text-text-secondary italic">Click to add description...</span>
                    )}
                  </div>
                )}

                {isEditing && (
                  <div className="flex items-center gap-2 mt-3">
                    <Button
                      size="sm"
                      onClick={handleSaveInline}
                      disabled={formLoading}
                      leftIcon={<Save className="w-4 h-4" />}
                    >
                      Save
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setIsEditing(false);
                        setEditedTitle(task.title || "");
                        setEditedDescription(task.description || "");
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>

              {/* Attachments Section */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-text-secondary mb-2 flex items-center gap-2">
                  <Paperclip className="w-4 h-4" />
                  Attachments
                  {attachments.length > 0 && (
                    <span className="text-xs bg-brand-dark/30 px-2 py-0.5 rounded-full">
                      {attachments.length}
                    </span>
                  )}
                </h3>

                {/* Upload Area */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border border-dashed border-brand-border rounded-lg p-4 text-center cursor-pointer hover:border-brand/50 hover:bg-brand-dark/30 transition-all group"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*,video/*,.pdf,.doc,.docx,.txt"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Upload className="w-6 h-6 text-text-secondary group-hover:text-brand mx-auto mb-2 transition-colors" />
                  <p className="text-text-secondary text-sm">
                    Click to upload files
                  </p>
                  <p className="text-text-secondary/60 text-xs mt-1">
                    Images, videos, PDF, Word, and text files
                  </p>
                </div>

                {/* Attachments List */}
                {attachments.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {attachments.map((attachment) => {
                      const FileIcon = getFileIcon(attachment.fileType);
                      return (
                        <div
                          key={attachment.id}
                          className="flex items-center gap-3 p-3 bg-brand-dark/30 rounded-lg group hover:bg-brand-dark/50 transition-colors"
                        >
                          {/* Preview thumbnail */}
                          {attachment.isImage && attachment.previewUrl ? (
                            <div
                              className="w-12 h-12 rounded-lg overflow-hidden bg-black/20 flex-shrink-0 cursor-pointer"
                              onClick={() => setPreviewAttachment(attachment)}
                            >
                              <img
                                src={attachment.previewUrl}
                                alt={attachment.fileName}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : attachment.isVideo && attachment.previewUrl ? (
                            <div
                              className="w-12 h-12 rounded-lg overflow-hidden bg-black/20 flex-shrink-0 cursor-pointer relative"
                              onClick={() => setPreviewAttachment(attachment)}
                            >
                              <video
                                src={attachment.previewUrl}
                                className="w-full h-full object-cover"
                                muted
                              />
                              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                <Play className="w-4 h-4 text-white" />
                              </div>
                            </div>
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-brand-dark/50 flex items-center justify-center flex-shrink-0">
                              <FileIcon className="w-6 h-6 text-text-secondary" />
                            </div>
                          )}

                          {/* File info */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-text-primary truncate">
                              {attachment.fileName}
                            </p>
                            <p className="text-xs text-text-secondary">
                              {formatFileSize(attachment.fileSize)}
                            </p>
                          </div>

                          {/* Delete button */}
                          <button
                            onClick={() => handleRemoveAttachment(attachment.id)}
                            className="p-1.5 rounded-lg text-text-secondary hover:text-rose-400 hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-all"
                            title="Remove attachment"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Attachment Preview Modal */}
                {previewAttachment && (
                  <>
                    <div
                      className="fixed inset-0 bg-black/80 z-50"
                      onClick={() => setPreviewAttachment(null)}
                    />
                    <div className="fixed inset-4 z-50 flex items-center justify-center">
                      <div className="relative max-w-4xl max-h-full">
                        <button
                          onClick={() => setPreviewAttachment(null)}
                          className="absolute -top-10 right-0 p-2 text-white hover:text-gray-300 transition-colors"
                        >
                          <X className="w-6 h-6" />
                        </button>
                        {previewAttachment.isImage ? (
                          <img
                            src={previewAttachment.previewUrl}
                            alt={previewAttachment.fileName}
                            className="max-w-full max-h-[80vh] rounded-lg"
                          />
                        ) : previewAttachment.isVideo ? (
                          <video
                            src={previewAttachment.previewUrl}
                            controls
                            autoPlay
                            className="max-w-full max-h-[80vh] rounded-lg"
                          />
                        ) : null}
                        <p className="text-center text-white mt-3">
                          {previewAttachment.fileName}
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Activity Tabs */}
              <div>
                <div className="flex items-center gap-4 border-b border-brand-border mb-4">
                  <button
                    onClick={() => setActiveTab("comments")}
                    className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === "comments"
                        ? "border-brand text-text-primary"
                        : "border-transparent text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      Comments
                      {comments.length > 0 && (
                        <span className="text-xs bg-brand-dark/30 px-1.5 py-0.5 rounded-full">
                          {comments.length}
                        </span>
                      )}
                    </span>
                  </button>
                  <button
                    onClick={() => setActiveTab("history")}
                    className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === "history"
                        ? "border-brand text-text-primary"
                        : "border-transparent text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <History className="w-4 h-4" />
                      History
                    </span>
                  </button>
                </div>

                {activeTab === "comments" ? (
                  <div>
                    {/* Comment Input */}
                    <div className="mb-4">
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand/30 flex items-center justify-center text-xs font-medium text-brand flex-shrink-0">
                          {getInitials(currentUser.name)}
                        </div>
                        <div className="flex-1">
                          <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleAddComment();
                              }
                            }}
                            placeholder="Add a comment... (Press Enter to submit, Shift+Enter for new line)"
                            rows={2}
                            className="w-full text-text-primary bg-brand-dark/30 border border-brand-border rounded-lg px-3 py-2 focus:outline-none focus:border-brand resize-none text-sm"
                          />
                          <div className="flex justify-end mt-2">
                            <Button
                              size="sm"
                              onClick={handleAddComment}
                              disabled={!newComment.trim() || commentSubmitting}
                              leftIcon={<Send className="w-3 h-3" />}
                            >
                              {commentSubmitting ? "Posting..." : "Comment"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Comments List */}
                    {comments.length > 0 ? (
                      <div className="space-y-4">
                        {comments.map((comment) => (
                          <div key={comment.id} className="flex gap-3 group">
                            <div className="w-8 h-8 rounded-full bg-brand/30 flex items-center justify-center text-xs font-medium text-brand flex-shrink-0">
                              {getInitials(comment.authorName)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-medium text-text-primary">
                                  {comment.authorName}
                                </span>
                                <span className="text-xs text-text-secondary">
                                  {formatCommentTime(comment.createdAt)}
                                </span>
                                {comment.authorUserId === currentUser.id && (
                                  <button
                                    onClick={() => handleDeleteComment(comment.id)}
                                    className="p-1 rounded text-text-secondary hover:text-rose-400 hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-all ml-auto"
                                    title="Delete comment"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                              <p className="text-sm text-text-primary whitespace-pre-wrap break-words">
                                {comment.content}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-text-secondary text-sm text-center py-4">
                        No comments yet. Be the first to comment.
                      </p>
                    )}
                  </div>
                ) : (
                  <div>
                    {taskActivities.length > 0 ? (
                      <ActivityFeed activities={taskActivities} />
                    ) : (
                      <p className="text-text-secondary text-sm text-center py-4">
                        No activity recorded for this task.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Details Sidebar */}
            <div className="w-64 p-4 flex-shrink-0">
              <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-4">
                Details
              </h3>

              <div className="space-y-4">
                {/* Assignee */}
                <div>
                  <label className="text-xs text-text-secondary mb-1 block">Assignee</label>
                  <div className="relative">
                    <button
                      onClick={() => setShowAssignMenu(!showAssignMenu)}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-brand-dark/30 hover:bg-brand-dark/50 transition-colors text-left"
                    >
                      {assignee ? (
                        <>
                          <div className="w-6 h-6 rounded-full bg-brand/30 flex items-center justify-center text-xs font-medium text-brand">
                            {getInitials(assignee.name)}
                          </div>
                          <span className="text-sm text-text-primary truncate flex-1">
                            {assignee.name}
                          </span>
                        </>
                      ) : (
                        <>
                          <User className="w-5 h-5 text-text-secondary" />
                          <span className="text-sm text-text-secondary">Unassigned</span>
                        </>
                      )}
                      <ChevronDown className="w-4 h-4 text-text-secondary" />
                    </button>

                    {showAssignMenu && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setShowAssignMenu(false)} />
                        <div className="absolute left-0 top-full mt-1 w-full bg-brand-light rounded-lg shadow-lg border border-brand-border py-1 z-20 max-h-48 overflow-y-auto">
                          <button
                            onClick={() => handleAssignChange(null)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-brand-dark/30"
                          >
                            <User className="w-4 h-4 text-text-secondary" />
                            <span className="text-text-secondary">Unassigned</span>
                          </button>
                          {members.map(({ userId, user }) => (
                            <button
                              key={userId}
                              onClick={() => handleAssignChange(userId)}
                              className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-brand-dark/30 ${
                                task.assignedToUserId === userId ? "bg-brand-dark/30" : ""
                              }`}
                            >
                              <div className="w-5 h-5 rounded-full bg-brand/30 flex items-center justify-center text-xs font-medium text-brand">
                                {getInitials(user?.name)}
                              </div>
                              <span className="text-text-primary truncate">{user?.name}</span>
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Due Date */}
                <div>
                  <label className="text-xs text-text-secondary mb-1 block">Due Date</label>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-brand-dark/30">
                    <Calendar className="w-4 h-4 text-text-secondary" />
                    <span className={`text-sm ${
                      task.dueDate && new Date(task.dueDate) < new Date()
                        ? "text-rose-400"
                        : "text-text-primary"
                    }`}>
                      {formatDate(task.dueDate)}
                    </span>
                  </div>
                </div>

                {/* Project */}
                <div>
                  <label className="text-xs text-text-secondary mb-1 block">Project</label>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-brand-dark/30">
                    <FolderKanban className="w-4 h-4 text-text-secondary" />
                    <span className="text-sm text-text-primary">{project?.name}</span>
                  </div>
                </div>

                {/* Task ID */}
                <div>
                  <label className="text-xs text-text-secondary mb-1 block">Task ID</label>
                  <div className="px-3 py-2 rounded-lg bg-brand-dark/30">
                    <span className="text-sm text-text-primary font-mono">{getTaskKey()}</span>
                  </div>
                </div>

                {/* Created */}
                <div>
                  <label className="text-xs text-text-secondary mb-1 block">Created</label>
                  <div className="px-3 py-2 rounded-lg bg-brand-dark/30">
                    <span className="text-sm text-text-primary">
                      {formatDate(task.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Updated */}
                <div>
                  <label className="text-xs text-text-secondary mb-1 block">Updated</label>
                  <div className="px-3 py-2 rounded-lg bg-brand-dark/30">
                    <span className="text-sm text-text-primary">
                      {formatDate(task.updatedAt)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modals */}
        <TaskFormModal
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          onSubmit={handleEditSubmit}
          task={task}
          members={members}
          isLoading={formLoading}
        />

        <ConfirmDialog
          isOpen={isDeleteOpen}
          onClose={() => setIsDeleteOpen(false)}
          onConfirm={handleDelete}
          title="Delete Task"
          message={`Are you sure you want to delete "${task.title}"? This action cannot be undone.`}
          confirmLabel="Delete Task"
          variant="danger"
          isLoading={formLoading}
        />
      </div>

      {/* CSS for slide-in animation */}
      <style>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.2s ease-out;
        }
      `}</style>
    </>
  );
};

export default TaskDetail;
