/**
 * TaskDetail - Jira-style task detail panel
 * Opens as a slide-in panel from the right side
 */

import { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useNavigate, Navigate, useLocation } from "react-router-dom";
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
  Upload,
  Play,
  XCircle,
  HelpCircle,
  Plus,
  Reply,
  SmilePlus,
  Bold,
  Italic,
  List,
  Code2,
  ListOrdered,
  Link2,
  AlertTriangle,
} from "lucide-react";

import { useProjectOptional } from "./ProjectLayout";
import { tasksApi, commentsApi, attachmentsApi } from "../../services/api";
import { useNotifications } from "../../context/NotificationContext";
import { Button, Alert, StatusPill, ConfirmDialog } from "../../components/ui";
import { TaskFormModal } from "../../components/tasks";
import { ActivityFeed } from "../../components/activity";
import {
  canEditAnyTask,
  canDeleteTask,
  canAssignTasks,
  canUpdateTaskStatus,
  canAddComments,
  canAddAttachments,
} from "../../utils/permissions";

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
  rejected: {
    icon: XCircle,
    label: "Rejected",
    color: "text-rose-400",
    bgColor: "bg-rose-500/20",
  },
  support: {
    icon: HelpCircle,
    label: "Supported",
    color: "text-cyan-400",
    bgColor: "bg-cyan-500/20",
  },
};

const priorityConfig = {
  low: { label: "Low", color: "text-gray-400", bgColor: "bg-gray-500/20" },
  medium: { label: "Medium", color: "text-amber-400", bgColor: "bg-amber-500/20" },
  high: { label: "High", color: "text-rose-400", bgColor: "bg-rose-500/20" },
};

const normalizeStatusForApi = (status) => {
  const normalized = (status || "todo").toLowerCase().replace("_", "-");
  if (normalized === "completed") return "done";
  return normalized;
};

const TaskDetail = () => {
  const { taskId, projectId: routeProjectId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const projectContext = useProjectOptional();

  // Get the origin page from location state or default to tasks
  const getOriginPath = () => {
    return location.state?.from || `/projects/${routeProjectId}/tasks`;
  };

  if (!projectContext) {
    return <Navigate to={`/projects/${routeProjectId}/tasks`} replace />;
  }

  const {
    project,
    tasks,
    members,
    activities,
    setTasks,
    fetchTasks,
    projectId,
    userRole,
    currentUser,
  } = projectContext;

  // Find task from context
  const task = tasks.find((t) => t.id === taskId);

  // Permission checks
  const permissions = useMemo(() => ({
    canEdit: canEditAnyTask(userRole),
    canDelete: canDeleteTask(userRole),
    canAssign: canAssignTasks(userRole),
    canChangeStatus: canUpdateTaskStatus(userRole, task, currentUser?.id),
    canComment: canAddComments(userRole),
    canAttach: canAddAttachments(userRole),
  }), [userRole, task, currentUser?.id]);

  // Local state
  const [loading, setLoading] = useState(!task);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("comments");
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showAssignMenu, setShowAssignMenu] = useState(false);
  const [showPriorityMenu, setShowPriorityMenu] = useState(false);
  const [showDueDateMenu, setShowDueDateMenu] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const [editedDueDate, setEditedDueDate] = useState("");

  // Notifications context for refreshing after comment
  const { refresh: refreshNotifications } = useNotifications();

  // Comments state
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [replyText, setReplyText] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentText, setEditingCommentText] = useState("");
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [replyTo, setReplyTo] = useState(null); // { id, authorName }
  const [showDeleteCommentDialog, setShowDeleteCommentDialog] = useState(false);
  const [commentToDeleteId, setCommentToDeleteId] = useState(null);
  const [mainCommentAttachments, setMainCommentAttachments] = useState([]);
  const [replyAttachments, setReplyAttachments] = useState([]);
  const [uploadTarget, setUploadTarget] = useState('task'); // 'task', 'main', or 'reply'
  const [taskNotFound, setTaskNotFound] = useState(false);
  const [isCommentFocused, setIsCommentFocused] = useState(false);

  // Attachments state
  const [attachments, setAttachments] = useState([]);
  const fileInputRef = useRef(null);
  const [previewAttachment, setPreviewAttachment] = useState(null);

  // Current user info for comments (from context)
  const commentUser = currentUser || {
    id: null,
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

  // Load comments and attachments when task changes
  useEffect(() => {
    if (task) {
      setComments(task.comments || []);
      setAttachments(task.attachments || []);
    }
  }, [task]);

  // Fetch full task data (including attachments/comments) when taskId changes
  useEffect(() => {
    if (taskId) {
      const fetchTaskFull = async () => {
        setLoading(true);
        const { data, error: fetchErr } = await tasksApi.getById(taskId);
        if (fetchErr || !data) {
          if (!task) setTaskNotFound(true);
        } else {
          setTaskNotFound(false);
          // Update/Add to tasks context with full data
          setTasks((prev) => {
            const exists = prev.find((t) => t.id === taskId);
            if (exists) {
              return prev.map((t) => (t.id === taskId ? data : t));
            }
            return [...prev, data];
          });
        }
        setLoading(false);
      };
      fetchTaskFull();
    }
  }, [taskId, setTasks]);

  // Initialize edit state when task loads
  useEffect(() => {
    if (task) {
      setEditedTitle(task.title || "");
      setEditedDescription(task.description || "");
      // Format date for input (YYYY-MM-DD)
      if (task.dueDate) {
        const date = new Date(task.dueDate);
        if (!isNaN(date.getTime())) {
          setEditedDueDate(date.toISOString().split('T')[0]);
        } else {
          setEditedDueDate("");
        }
      } else {
        setEditedDueDate("");
      }
    }
  }, [task]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && !previewAttachment && !isEditOpen && !isDeleteOpen) {
        handleClose();
      }
      
      // Shortcut 'M' to focus comment input (if not already focused on an input)
      if (e.key.toLowerCase() === 'm' && 
          document.activeElement.tagName !== 'INPUT' && 
          document.activeElement.tagName !== 'TEXTAREA' &&
          !isEditOpen && !isDeleteOpen) {
        setIsCommentFocused(true);
        // Wait for render then focus
        setTimeout(() => {
          document.querySelector('textarea[autoFocus]')?.focus();
        }, 0);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [previewAttachment, isEditOpen, isDeleteOpen, navigate, projectId]);

  const handleClose = () => {
    navigate(getOriginPath());
  };

  const handleStatusChange = async (newStatus) => {
    setShowStatusMenu(false);
    if (!task || newStatus === task.status?.toLowerCase()) return;

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, status: normalizeStatusForApi(newStatus) } : t
      )
    );

    try {
      const { error } = await tasksApi.updateStatus(taskId, normalizeStatusForApi(newStatus));
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
          ? { ...t, assigneeId: userId, assignedToUserId: userId, assigneeName }
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

  const handleDueDateChange = async (newDueDate) => {
    setShowDueDateMenu(false);
    if (!task) return;

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, dueDate: newDueDate } : t
      )
    );

    try {
      const { error } = await tasksApi.update(taskId, { dueDate: newDueDate });
      if (error) throw new Error(error);
      setEditedDueDate(newDueDate);
    } catch (err) {
      fetchTasks();
      setError(err.message);
      // Reset to original value
      if (task.dueDate) {
        const date = new Date(task.dueDate);
        if (!isNaN(date.getTime())) {
          setEditedDueDate(date.toISOString().split('T')[0]);
        } else {
          setEditedDueDate("");
        }
      } else {
        setEditedDueDate("");
      }
    }
  };

  const handleTitleChange = async (newTitle) => {
    if (!task || newTitle === task.title) return;
    setIsEditingTitle(false);

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, title: newTitle } : t
      )
    );

    try {
      const { error } = await tasksApi.update(taskId, { title: newTitle });
      if (error) throw new Error(error);
      setEditedTitle(newTitle);
    } catch (err) {
      fetchTasks();
      setError(err.message);
      setEditedTitle(task.title || "");
    }
  };

  const handleSaveInline = async () => {
    if (!task) return;
    
    setFormLoading(true);
    try {
      const { data, error } = await tasksApi.update(taskId, {
        description: editedDescription,
      });
      if (error) throw new Error(error);
      
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, ...data } : t))
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
      navigate(getOriginPath());
    } catch (err) {
      setError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditSubmit = async (formData, filesToUpload = []) => {
    setFormLoading(true);
    try {
      const { data, error } = await tasksApi.update(taskId, formData);
      if (error) throw new Error(error);

      if (filesToUpload.length > 0) {
        let uploaded = [];
        for (const file of filesToUpload) {
          const { data: attachment } = await attachmentsApi.upload(taskId, file);
          if (attachment) uploaded.push(attachment);
        }
        if (uploaded.length > 0) {
          setAttachments(prev => [...uploaded, ...prev]);
        }
      }

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
    const isReply = !!replyTo;
    const text = isReply ? replyText : newComment;
    if (!text.trim()) return;

    setCommentSubmitting(true);
    
    try {
      // Use API to add comment - include draft attachments
      const { data: comment, error: commentError } = await commentsApi.add(taskId, {
        text: text.trim(),
        parentId: replyTo?.id,
        attachmentIds: isReply ? replyAttachments.map(a => a.id) : mainCommentAttachments.map(a => a.id)
      });
      
      if (commentError) {
        console.error('Failed to add comment:', commentError);
        setCommentSubmitting(false);
        return;
      }
      
      setComments((prev) => [...prev, comment]);
      
      // Remove these attachments from the main attachments list (since they are now in a comment)
      const attachmentIdsToRemove = (comment.attachments || []).map(a => a.id);
      setAttachments((prev) => prev.filter(a => !attachmentIdsToRemove.includes(a.id)));
      
      // Update global tasks context as well
      setTasks((prevTasks) => 
        prevTasks.map(t => 
          t.id === taskId 
            ? { 
                ...t, 
                attachments: (t.attachments || []).filter(a => !attachmentIdsToRemove.includes(a.id)),
                comments: [...(t.comments || []), comment]
              } 
            : t
        )
      );

      if (isReply) {
        setReplyText("");
        setReplyAttachments([]);
      } else {
        setNewComment("");
        setMainCommentAttachments([]);
      }
      setReplyTo(null);
      
      // Refresh notifications after adding comment (to see bell update)
      refreshNotifications();
    } catch (err) {
      console.error('Error adding comment:', err);
    } finally {
      setCommentSubmitting(false);
    }
  };

  const insertStyle = (styleType) => {
    // Find focused textarea
    const textarea = document.querySelector('textarea:focus') || document.activeElement;
    if (!textarea || textarea.tagName !== 'TEXTAREA') return;

    const isDescriptionInput = textarea.id === 'task-description-editor';
    const isReplyInput = textarea.placeholder?.includes('Reply to') || textarea.closest('.ml-8');
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    let text = "";
    if (isDescriptionInput) text = editedDescription;
    else if (isReplyInput) text = replyText;
    else text = newComment;

    const before = text.substring(0, start);
    const after = text.substring(end);
    const selected = text.substring(start, end);

    let replacement = "";
    let cursorOffset = 0;

    switch (styleType) {
      case 'bold':
        replacement = `**${selected}**`;
        cursorOffset = 2;
        break;
      case 'italic':
        replacement = `*${selected}*`;
        cursorOffset = 1;
        break;
      case 'list':
        replacement = `\n- ${selected}`;
        cursorOffset = 3;
        break;
      case 'ordered-list':
        replacement = `\n1. ${selected}`;
        cursorOffset = 4;
        break;
      case 'code':
        replacement = `\`${selected}\``;
        cursorOffset = 1;
        break;
      default:
        return;
    }

    const newText = before + replacement + after;
    
    if (isDescriptionInput) setEditedDescription(newText);
    else if (isReplyInput) setReplyText(newText);
    else setNewComment(newText);

    // Maintain focus and selection
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + cursorOffset,
        end + cursorOffset
      );
    }, 0);
  };

  const handleEditorKeyDown = (e) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'b') {
        e.preventDefault();
        insertStyle('bold');
      }
      if (e.key === 'i') {
        e.preventDefault();
        insertStyle('italic');
      }
    }
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAddComment();
    }
    if (e.key === "Escape") setReplyTo(null);
  };

  const handleToggleReaction = async (commentId, emoji) => {
    try {
      const { data: updatedComment, error } = await commentsApi.react(taskId, commentId, emoji, projectId);
      if (error) throw new Error(error);
      
      if (updatedComment) {
        setComments(prev => prev.map(c => c.id === commentId ? updatedComment : c));
      }
    } catch (err) {
      console.error('Failed to toggle reaction:', err);
    }
  };

  const handleDeleteComment = async (commentId) => {
    setCommentToDeleteId(commentId);
    setShowDeleteCommentDialog(true);
  };

  const confirmDeleteComment = async () => {
    if (!commentToDeleteId) return;
    setCommentSubmitting(true);
    try {
      const { success, error } = await commentsApi.delete(taskId, commentToDeleteId);
      if (error) throw new Error(error);
      if (success) {
        setComments((prev) => prev.filter((c) => c.id !== commentToDeleteId));
      }
    } catch (err) {
      console.error('Failed to delete comment:', err);
    } finally {
      setCommentSubmitting(false);
      setShowDeleteCommentDialog(false);
      setCommentToDeleteId(null);
    }
  };

  const handleUpdateComment = async (commentId) => {
    if (!editingCommentText.trim()) return;
    try {
      const { data, error } = await commentsApi.update(taskId, commentId, editingCommentText);
      if (error) throw new Error(error);
      setComments(prev => prev.map(c => c.id === commentId ? data : c));
      setEditingCommentId(null);
      setEditingCommentText("");
    } catch (err) {
      console.error('Failed to update comment:', err);
    }
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
  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setFormLoading(true);
    const target = uploadTarget;
    
    try {
      for (const file of files) {
        const { data: attachment, error: uploadError } = await attachmentsApi.upload(taskId, file);
        if (uploadError) throw new Error(uploadError);
        
        if (attachment) {
          if (target === 'task') {
            // Only add to task-wide attachments if targeted for task
            setAttachments((prev) => [attachment, ...prev]);

            // Sync with global tasks context
            setTasks((prevTasks) => 
              prevTasks.map(t => 
                t.id === taskId 
                  ? { ...t, attachments: [attachment, ...(t.attachments || [])] } 
                  : t
              )
            );
          } else if (target === 'reply') {
            setReplyAttachments(prev => [...prev, attachment]);
          } else if (target === 'main') {
            setMainCommentAttachments(prev => [...prev, attachment]);
          }
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setFormLoading(false);
      setUploadTarget('task'); // Reset to default
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveAttachment = async (attachmentId) => {
    try {
      const { success, error: deleteError } = await attachmentsApi.delete(attachmentId);
      if (deleteError) throw new Error(deleteError);
      
      if (success) {
        setAttachments((prev) => prev.filter((a) => a.id !== attachmentId));
      }
    } catch (err) {
      setError(err.message);
    }
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

  const getFullUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
    return `${baseUrl}${url}`;
  };

  const getTaskKey = () => {
    const index = tasks.findIndex((t) => t.id === taskId);
    return `${project?.key || "TASK"}-${index + 1}`;
  };

  const renderCommentContent = (text) => {
    if (!text) return null;
    
    // Convert to markdown-like display
    let lines = text.split('\n');
    let content = [];

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        
        // Mentions
        line = line.replace(/(@\w+)/g, '###MENTION###$1###MENTION###');
        
        // Bold
        line = line.replace(/\*\*(.*?)\*\*/g, '###BOLD###$1###BOLD###');
        
        // Italic
        line = line.replace(/_(.*?)_/g, '###ITALIC###$1###ITALIC###');

        // Code block (Simple check for ```)
        if (line.startsWith('```')) {
            let codeBlock = [];
            i++;
            while (i < lines.length && !lines[i].startsWith('```')) {
                codeBlock.push(lines[i]);
                i++;
            }
            content.push(
                <pre key={i} className="bg-brand-dark/50 p-4 rounded-lg my-3 font-mono text-xs overflow-x-auto border border-brand-border/50 text-cyan-400">
                    {codeBlock.join('\n')}
                </pre>
            );
            continue;
        }

        // List item (Bullet)
        if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
            content.push(
                <li key={i} className="ml-4 list-disc text-sm text-text-primary/90">
                    {line.trim().substring(2)}
                </li>
            );
            continue;
        }

        // List item (Ordered)
        const orderedMatch = line.trim().match(/^(\d+)\. /);
        if (orderedMatch) {
            content.push(
                <li key={i} className="ml-4 list-decimal text-sm text-text-primary/90">
                    {line.trim().substring(orderedMatch[0].length)}
                </li>
            );
            continue;
        }

        // Processing parts of line (Mentions, Bold, Italic)
        const parts = line.split('###');
        const processedLine = parts.map((part, idx) => {
            if (part.startsWith('MENTION')) return <span key={idx} className="text-brand bg-brand/10 px-1 py-0.5 rounded font-medium">@{part.substring(8)}</span>;
            if (part.startsWith('BOLD')) return <strong key={idx} className="font-bold text-text-primary">{part.substring(4)}</strong>;
            if (part.startsWith('ITALIC')) return <em key={idx} className="italic text-text-primary/80">{part.substring(6)}</em>;
            return part;
        });

        content.push(<p key={i} className="text-sm text-text-primary/90 leading-relaxed min-h-[1em]">{processedLine}</p>);
    }
    
    return <div className="space-y-1">{content}</div>;
  };

  const renderComments = (allComments, parentId = null, depth = 0) => {
    const filtered = allComments.filter(c => c.parentId === parentId);
    
    return filtered.map((comment) => {
      const reactions = comment.reactions || [];
      const groupedReactions = reactions.reduce((acc, r) => {
        acc[r.emoji] = (acc[r.emoji] || 0) + 1;
        return acc;
      }, {});

      return (
        <div key={comment.id} className={`${depth > 0 ? "ml-8 mt-4 border-l-2 border-brand-border pl-6" : ""}`}>
          <div className="flex gap-4 group">
            {/* Avatar */}
            <div className="w-10 h-10 rounded bg-brand/30 flex items-center justify-center text-sm font-bold text-brand flex-shrink-0 overflow-hidden shadow-sm">
              {comment.user?.avatar ? (
                <img src={getFullUrl(comment.user.avatar)} alt={comment.user.name} className="w-full h-full object-cover" />
              ) : (
                getInitials(comment.user?.name || "Unknown")
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-sm font-bold text-text-primary hover:underline cursor-pointer">
                  {comment.user?.name || "Unknown"}
                </span>
                <span className="text-xs text-text-secondary">
                  {new Date(comment.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric"
                  })} at {new Date(comment.createdAt).toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit"
                  })}
                </span>
              </div>

              {/* Text / Edit Area */}
              {editingCommentId === comment.id ? (
                <div className="mt-2">
                  <textarea
                    value={editingCommentText}
                    onChange={(e) => setEditingCommentText(e.target.value)}
                    className="w-full bg-brand-dark/20 border border-brand-border rounded-lg p-3 text-sm text-text-primary focus:outline-none focus:border-brand/50 resize-none shadow-inner"
                    rows={3}
                    autoFocus
                  />
                  <div className="flex justify-end gap-3 mt-2">
                    <button 
                      onClick={() => setEditingCommentId(null)}
                      className="text-xs text-text-secondary hover:text-text-primary transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={() => handleUpdateComment(comment.id)}
                      className="text-xs text-brand font-bold hover:text-brand-hover transition-colors"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-text-primary/90 leading-relaxed space-y-2">
                  {renderCommentContent(comment.text)}
                </div>
              )}

              {/* Comment Attachments */}
              {comment.attachments && comment.attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {comment.attachments.map(att => {
                    const isImage = att.fileType?.startsWith("image/");
                    return (
                      <div 
                        key={att.id} 
                        className="relative group rounded-lg overflow-hidden border border-brand-border bg-brand-dark/10 cursor-pointer"
                        onClick={() => setPreviewAttachment(att)}
                      >
                        {isImage ? (
                          <img 
                            src={getFullUrl(att.fileUrl)} 
                            alt={att.fileName} 
                            className="w-24 h-24 object-cover hover:opacity-80 transition-opacity" 
                          />
                        ) : (
                          <div className="w-24 h-24 flex flex-col items-center justify-center p-2 text-center bg-brand-dark/20">
                            <Paperclip className="w-6 h-6 text-text-secondary mb-1" />
                            <span className="text-[10px] text-text-primary truncate w-full px-1">{att.fileName}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Reactions List */}
              {Object.keys(groupedReactions).length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {Object.entries(groupedReactions).map(([emoji, count]) => (
                    <button
                      key={emoji}
                      onClick={() => handleToggleReaction(comment.id, emoji)}
                      className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-xs transition-all ${
                        reactions.some(r => r.userId === currentUser?.id && r.emoji === emoji)
                          ? "bg-brand/20 border-brand text-brand"
                          : "bg-brand-dark/20 border-brand-border text-text-secondary hover:border-text-secondary"
                      }`}
                    >
                      <span>{emoji}</span>
                      <span className="font-medium">{count}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-4 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => {
                    setReplyTo({ id: comment.id, authorName: comment.user?.name });
                    // Scroll to input or focus
                  }}
                  className="flex items-center gap-1.5 text-text-secondary hover:text-text-primary text-xs font-medium"
                >
                  <Reply className="w-3.5 h-3.5" />
                  Reply
                </button>
                <div className="relative group/react">
                  <button className="flex items-center gap-1.5 text-text-secondary hover:text-text-primary text-xs font-medium">
                    <SmilePlus className="w-3.5 h-3.5" />
                  </button>
                  <div className="absolute bottom-full left-0 mb-2 invisible group-hover/react:visible flex p-1.5 bg-brand-light border border-brand-border rounded-lg shadow-xl z-50 animate-in fade-in slide-in-from-bottom-2 duration-150">
                    {['👍', '🔥', '👀', '🚀', '❤️', '✅'].map(emoji => (
                      <button
                        key={emoji}
                        onClick={() => handleToggleReaction(comment.id, emoji)}
                        className="p-1.5 hover:bg-brand-dark/30 rounded transition-colors"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="relative group/more">
                  <button className="flex items-center gap-1.5 text-text-secondary hover:text-text-primary text-xs font-medium p-1 rounded hover:bg-brand-dark/30 transition-all">
                    <MoreHorizontal className="w-3.5 h-3.5" />
                  </button>
                  {comment.userId === currentUser?.id && (
                    <div className="absolute top-full left-0 mt-1 invisible group-hover/more:visible bg-brand-light border border-brand-border rounded-lg shadow-2xl py-1 z-50 w-28 animate-in fade-in slide-in-from-top-1 duration-100 overflow-hidden">
                      <button 
                        onClick={() => {
                          setEditingCommentId(comment.id);
                          setEditingCommentText(comment.text);
                        }}
                        className="w-full text-left px-3 py-2 text-[11px] text-text-primary hover:bg-brand-dark/50 flex items-center gap-2 transition-colors"
                      >
                        <Edit2 className="w-3 h-3 text-brand" />
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteComment(comment.id)}
                        className="w-full text-left px-3 py-2 text-[11px] text-red-400 hover:bg-red-400/10 flex items-center gap-2 transition-colors border-t border-brand-border/30"
                      >
                        <Trash2 className="w-3 h-3" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Nested Replies */}
          {renderComments(allComments, comment.id, depth + 1)}

          {/* Inline Reply Form */}
          {replyTo?.id === comment.id && (
            <div className={`ml-8 mt-4 border-l-2 border-brand pr-0 pl-6 animate-in slide-in-from-left-2 duration-200`}>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center text-xs font-bold text-brand flex-shrink-0 overflow-hidden shadow-sm">
                  {commentUser.avatar ? (
                    <img src={getFullUrl(commentUser.avatar)} alt={commentUser.name} className="w-full h-full object-cover" />
                  ) : (
                    getInitials(commentUser.name)
                  )}
                </div>
                <div className="flex-1">
                  <span className="text-xs text-text-secondary mb-2 block font-medium">
                    Replying to <span className="text-brand">@{replyTo.authorName}</span>
                  </span>
                  <div className="bg-brand-dark/20 border border-brand-border rounded-lg overflow-hidden flex flex-col focus-within:border-brand/40 transition-colors shadow-inner">
                    {/* Header Toolbar (Professional Jira Style) */}
                    <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-brand-border/50 bg-white/5">
                      <button type="button" onClick={() => insertStyle('bold')} className="p-1.5 rounded hover:bg-brand-dark/40 text-text-secondary hover:text-text-primary transition-all" title="Bold (Ctrl+B)">
                        <Bold className="w-4 h-4" />
                      </button>
                      <button type="button" onClick={() => insertStyle('italic')} className="p-1.5 rounded hover:bg-brand-dark/40 text-text-secondary hover:text-text-primary transition-all" title="Italic (Ctrl+I)">
                        <Italic className="w-4 h-4" />
                      </button>
                      
                      <div className="w-px h-5 bg-brand-border/20 mx-1.5" />

                      <button type="button" onClick={() => insertStyle('list')} className="p-1.5 rounded hover:bg-brand-dark/40 text-text-secondary hover:text-text-primary transition-all" title="Bullet List">
                        <List className="w-4 h-4" />
                      </button>
                      <button type="button" onClick={() => insertStyle('ordered-list')} className="p-1.5 rounded hover:bg-brand-dark/40 text-text-secondary hover:text-text-primary transition-all" title="Numbered List">
                        <ListOrdered className="w-4 h-4" />
                      </button>
                      
                      <div className="w-px h-5 bg-brand-border/20 mx-1.5" />

                      <button type="button" onClick={() => insertStyle('code')} className="p-1.5 rounded hover:bg-brand-dark/40 text-text-secondary hover:text-text-primary transition-all" title="Code Block">
                        <Code2 className="w-4 h-4" />
                      </button>
                      
                      <div className="flex items-center gap-0.5 ml-auto">
                        <button 
                          type="button"
                          onClick={() => {
                            setUploadTarget('reply');
                            fileInputRef.current?.click();
                          }} 
                          className="p-1.5 rounded hover:bg-brand-dark/40 text-text-secondary hover:text-text-primary transition-all" 
                          title="Attach Files"
                        >
                          <Paperclip className="w-4 h-4" />
                        </button>
                        <div className="relative group/emojipick">
                          <button type="button" className="p-1.5 rounded hover:bg-brand-dark/40 text-text-secondary hover:text-text-primary transition-all">
                            <SmilePlus className="w-4 h-4" />
                          </button>
                          <div className="absolute top-full right-0 mt-1 invisible group-hover/emojipick:visible bg-brand-light border border-brand-border rounded-lg shadow-xl p-2 z-50 grid grid-cols-4 gap-1 animate-in zoom-in-95 duration-100">
                            {['👍', '🔥', '🚀', '✅', '❤️', '👀', '🎉', '💡'].map(e => (
                              <button 
                                type="button" 
                                key={e} 
                                onClick={() => setReplyText(prev => prev + e)} 
                                className="p-1.5 hover:bg-brand-dark/30 rounded text-base"
                              >
                                {e}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Input Area */}
                    <textarea
                      autoFocus
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      onKeyDown={handleEditorKeyDown}
                      rows={5}
                      className="w-full bg-transparent text-sm text-text-primary px-4 py-3 focus:outline-none resize-none custom-scrollbar"
                      placeholder={`Reply to ${replyTo.authorName}...`}
                    />
                    {/* Draft Attachments Preview in Reply */}
                    {replyAttachments.length > 0 && (
                      <div className="px-4 pb-2 flex flex-wrap gap-2">
                        {replyAttachments.map(att => {
                          const isImage = att.fileType?.startsWith('image/');
                          return (
                            <div key={att.id} className="relative group">
                              {isImage ? (
                                <div className="w-14 h-14 rounded overflow-hidden border border-brand-border/50 bg-brand-dark/20 shadow-sm">
                                  <img src={getFullUrl(att.fileUrl)} className="w-full h-full object-cover" alt="" />
                                </div>
                              ) : (
                                <div className="flex items-center gap-1.5 px-2 py-1 bg-brand-dark/40 border border-brand-border/30 rounded text-[10px] text-text-secondary h-14">
                                  <FileText className="w-3 h-3 text-brand" />
                                  <span className="truncate max-w-[80px]">{att.fileName}</span>
                                </div>
                              )}
                              <button 
                                type="button"
                                onClick={() => setReplyAttachments(prev => prev.filter(a => a.id !== att.id))} 
                                className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center text-[10px] shadow-sm opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-rose-600"
                              >
                                <X className="w-2.5 h-2.5" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  
                  {/* Footer Buttons */}
                  <div className="flex items-center gap-3 mt-3">
                    <Button 
                      size="sm" 
                      onClick={handleAddComment}
                      disabled={!replyText.trim() || commentSubmitting}
                    >
                      {commentSubmitting ? "Saving..." : "Save"}
                    </Button>
                    <button 
                      onClick={() => {
                        setReplyTo(null);
                        setReplyText("");
                      }}
                      className="text-sm text-text-secondary hover:text-text-primary transition-colors font-medium px-2"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    });
  };

  const getAssignee = () => {
    const assigneeId = task?.assigneeId ?? task?.assignedToUserId;
    if (!assigneeId) return null;
    const member = members.find((m) => m.userId === assigneeId);
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 pb-20 mt-10">
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" />
        <div className="relative w-full max-w-5xl bg-brand-light shadow-2xl rounded-xl z-50 flex flex-col h-[85vh] animate-in zoom-in-95 duration-200">
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
  if (taskNotFound && !loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 pb-20 mt-10">
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={handleClose} />
        <div className="relative w-full max-w-5xl bg-brand-light shadow-2xl rounded-xl z-50 flex flex-col h-[85vh] animate-in zoom-in-95 duration-200">
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 max-h-screen">
        {/* Backdrop overlay */}
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
          onClick={(e) => {
            // Don't close if clicking on status menu or its children
            if (showStatusMenu) {
              e.preventDefault();
              e.stopPropagation();
              return;
            }
            handleClose();
          }}
        />

        {/* Modal Panel */}
        <div className="relative w-full max-w-[1200px] h-[90vh] bg-brand-light shadow-2xl rounded-xl z-50 flex flex-col animate-in zoom-in-95 duration-200 overflow-hidden border border-brand-border/50">
        {/* Header */}
        <div className="h-14 border-b border-brand-border px-6 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="px-2 py-1 rounded bg-brand/20 text-brand text-xs font-mono">
              {getTaskKey()}
            </span>
            <span className="text-sm text-text-secondary">{project?.name}</span>
          </div>
          <div className="flex items-center gap-2">
            {permissions.canDelete && (
              <button
                onClick={() => setIsDeleteOpen(true)}
                className="p-2 rounded-lg hover:bg-rose-500/10 text-text-secondary hover:text-rose-400 transition-colors"
                title="Delete task"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={handleClose}
              className="p-2 rounded-lg hover:bg-brand-dark/30 text-text-secondary hover:text-text-primary transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Section */}
        <div className="flex-1 overflow-hidden bg-brand-light">
          <div className="flex flex-col lg:flex-row h-full">
            {/* Main Content Component (70%) - Independent Scroll */}
            <div className="flex-1 lg:w-[70%] p-6 lg:p-8 border-b lg:border-b-0 lg:border-r border-brand-border overflow-y-auto custom-scrollbar">
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
                {isEditingTitle && permissions.canEdit ? (
                  <input
                    type="text"
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleTitleChange(editedTitle);
                      } else if (e.key === "Escape") {
                        setIsEditingTitle(false);
                        setEditedTitle(task.title || "");
                      }
                    }}
                    onBlur={() => handleTitleChange(editedTitle)}
                    className="w-full text-xl font-semibold text-text-primary bg-brand-dark/30 border border-brand-border rounded-lg px-3 py-2 focus:outline-none focus:border-brand"
                    autoFocus
                  />
                ) : (
                  <h1
                    className={`text-xl font-semibold text-text-primary ${permissions.canEdit ? "cursor-pointer hover:text-brand" : ""} transition-colors`}
                    onClick={() => permissions.canEdit && setIsEditingTitle(true)}
                    title={permissions.canEdit ? "Click to edit title" : undefined}
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
                    onClick={(e) => {
                      e.stopPropagation();
                      if (permissions.canChangeStatus) {
                        setShowStatusMenu(!showStatusMenu);
                      }
                    }}
                    disabled={!permissions.canChangeStatus}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${statusCfg.bgColor} ${statusCfg.color} ${
                      permissions.canChangeStatus ? "cursor-pointer" : "cursor-default opacity-70"
                    }`}
                    title={permissions.canChangeStatus ? "Change status" : "You cannot change this task's status"}
                  >
                    <StatusIcon className="w-4 h-4" />
                    {statusCfg.label}
                    {permissions.canChangeStatus && <ChevronDown className="w-4 h-4" />}
                  </button>
                  {showStatusMenu && permissions.canChangeStatus && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowStatusMenu(false)} />
                      <div className="absolute left-0 top-full mt-1 w-40 bg-brand-light rounded-lg shadow-lg border border-brand-border py-1 z-20">
                        {Object.entries(statusConfig).map(([key, cfg]) => {
                          if (key === "done") return null; // Skip duplicate
                          const Icon = cfg.icon;
                          return (
                            <button
                              key={key}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusChange(key);
                              }}
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
                    onClick={() => permissions.canEdit && setShowPriorityMenu(!showPriorityMenu)}
                    disabled={!permissions.canEdit}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${priorityCfg.bgColor} ${priorityCfg.color} ${
                      permissions.canEdit ? "cursor-pointer" : "cursor-default opacity-70"
                    }`}
                    title={permissions.canEdit ? "Change priority" : "You cannot change task priority"}
                  >
                    {priorityCfg.label}
                    {permissions.canEdit && <ChevronDown className="w-4 h-4" />}
                  </button>
                  {showPriorityMenu && permissions.canEdit && (
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
                {isEditing && permissions.canEdit ? (
                  <div className="group/editor bg-brand-dark/30 border border-brand-border rounded-lg overflow-hidden focus-within:border-brand transition-all">
                    <div className="flex items-center gap-1 p-2 border-b border-brand-border bg-brand-dark/20">
                      <button type="button" onClick={() => insertStyle('bold')} className="p-1.5 rounded hover:bg-brand-dark/50 text-text-secondary hover:text-text-primary transition-colors" title="Bold (Ctrl+B)"><Bold className="w-4 h-4" /></button>
                      <button type="button" onClick={() => insertStyle('italic')} className="p-1.5 rounded hover:bg-brand-dark/50 text-text-secondary hover:text-text-primary transition-colors" title="Italic (Ctrl+I)"><Italic className="w-4 h-4" /></button>
                      <div className="w-px h-4 bg-brand-border mx-1" />
                      <button type="button" onClick={() => insertStyle('list')} className="p-1.5 rounded hover:bg-brand-dark/50 text-text-secondary hover:text-text-primary transition-colors" title="Bullet List"><List className="w-4 h-4" /></button>
                      <button type="button" onClick={() => insertStyle('ordered-list')} className="p-1.5 rounded hover:bg-brand-dark/50 text-text-secondary hover:text-text-primary transition-colors" title="Numbered List"><ListOrdered className="w-4 h-4" /></button>
                      <div className="w-px h-4 bg-brand-border mx-1" />
                      <button type="button" onClick={() => insertStyle('code')} className="p-1.5 rounded hover:bg-brand-dark/50 text-text-secondary hover:text-text-primary transition-colors" title="Code"><Code2 className="w-4 h-4" /></button>
                    </div>
                    <textarea
                      id="task-description-editor"
                      value={editedDescription}
                      onChange={(e) => setEditedDescription(e.target.value)}
                      onKeyDown={handleEditorKeyDown}
                      rows={6}
                      className="w-full text-text-primary bg-transparent border-none rounded-none px-3 py-2 focus:outline-none focus:ring-0 resize-none min-h-[150px]"
                      placeholder="Add a more detailed description..."
                      autoFocus
                    />
                  </div>
                ) : (
                  <div
                    className={`text-text-primary bg-brand-dark/30 rounded-lg p-4 min-h-[100px] whitespace-pre-wrap ${permissions.canEdit ? "cursor-pointer hover:bg-brand-dark/50" : ""} transition-colors`}
                    onClick={() => permissions.canEdit && setIsEditing(true)}
                  >
                    {task.description || (
                      <span className="text-text-secondary italic">
                        {permissions.canEdit ? "Click to add description..." : "No description"}
                      </span>
                    )}
                  </div>
                )}

                {/* Inline Description Images */}
                {!isEditing && attachments.filter(a => a.fileType?.startsWith("image/")).length > 0 && (
                  <div className="mt-4 flex flex-col gap-4 max-w-full overflow-hidden">
                    {attachments
                      .filter(a => a.fileType?.startsWith("image/"))
                      .map(image => (
                        <div 
                          key={`desc-img-${image.id}`} 
                          className="rounded-lg bg-brand-dark/10 border border-brand-border cursor-zoom-in group"
                          onClick={() => setPreviewAttachment(image)}
                        >
                          <img 
                            src={getFullUrl(image.fileUrl)} 
                            alt={image.fileName} 
                            className="w-full h-auto object-contain max-h-[500px]" 
                          />
                        </div>
                    ))}
                  </div>
                )}

                {isEditing && permissions.canEdit && (
                  <div className="flex items-center gap-2 mt-3">
                    <Button
                      size="sm"
                      onClick={handleSaveInline}
                      disabled={formLoading}
                      leftIcon={<Save className="w-4 h-4" />}
                    >
                      Save Description
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setIsEditing(false);
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
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-text-secondary flex items-center gap-2">
                    <Paperclip className="w-4 h-4" />
                    Attachments
                    {attachments.length > 0 && (
                      <span className="text-xs bg-brand-dark/30 px-2 py-0.5 rounded-full">
                        {attachments.length}
                      </span>
                    )}
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setUploadTarget('task');
                      fileInputRef.current?.click();
                    }}
                    className="p-1 rounded text-text-secondary hover:text-text-primary hover:bg-brand-dark/30 transition-colors"
                    title="Upload attachments"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*,video/*,.pdf,.doc,.docx,.txt"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>

                {/* Attachments Grid */}
                {attachments.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {attachments.map((attachment) => {
                      const FileIcon = getFileIcon(attachment.fileType);
                      const isImage = attachment.fileType?.startsWith("image/");
                      const isVideo = attachment.fileType?.startsWith("video/");
                      
                      return (
                        <div
                          key={attachment.id}
                          className="relative group rounded-lg overflow-hidden border border-brand-border bg-brand-dark/5 flex flex-col"
                        >
                          {/* Preview/Thumbnail */}
                          <div
                            className="aspect-video w-full bg-black/10 flex items-center justify-center cursor-pointer relative"
                            onClick={() => setPreviewAttachment(attachment)}
                          >
                            {isImage ? (
                              <img
                                src={getFullUrl(attachment.fileUrl)}
                                alt={attachment.fileName}
                                className="w-full h-full object-cover"
                              />
                            ) : isVideo ? (
                              <>
                                <video
                                  src={getFullUrl(attachment.fileUrl)}
                                  className="w-full h-full object-cover"
                                  muted
                                />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                  <Play className="w-6 h-6 text-white" />
                                </div>
                              </>
                            ) : (
                              <FileIcon className="w-8 h-8 text-text-secondary opacity-50" />
                            )}
                          </div>

                          {/* File Details Bar */}
                          <div className="p-2 flex items-center justify-between bg-brand-dark/30 flex-1 min-h-[44px]">
                            <div className="min-w-0 pr-2">
                              <p className="text-xs text-text-primary truncate" title={attachment.fileName}>
                                {attachment.fileName}
                              </p>
                              <p className="text-[10px] text-text-secondary mt-0.5">
                                {formatDate(attachment.createdAt)}
                              </p>
                            </div>
                            <button
                              onClick={() => handleRemoveAttachment(attachment.id)}
                              className="p-1 rounded text-text-secondary hover:text-rose-400 hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
                              title="Remove attachment"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
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
                        {previewAttachment.fileType?.startsWith("image/") ? (
                          <img
                            src={getFullUrl(previewAttachment.fileUrl)}
                            alt={previewAttachment.fileName}
                            className="max-w-full max-h-[80vh] rounded-lg"
                          />
                        ) : previewAttachment.fileType?.startsWith("video/") ? (
                          <video
                            src={getFullUrl(previewAttachment.fileUrl)}
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

                <div className="mt-8">
                  {activeTab === "comments" ? (
                    <div className="comments-tab-content">
                      {/* Comment Input */}
                      <div className="mb-8">
                        <div className="flex gap-4">
                          <div className="w-10 h-10 rounded-full bg-brand/20 flex items-center justify-center text-sm font-bold text-brand flex-shrink-0 shadow-inner overflow-hidden border border-brand-border/20">
                            {commentUser.avatar ? (
                              <img src={getFullUrl(commentUser.avatar)} alt="" className="w-full h-full object-cover" />
                            ) : (
                              getInitials(commentUser.name)
                            )}
                          </div>
                          <div className="flex-1">
                            {!isCommentFocused && !newComment ? (
                              <div 
                                onClick={() => setIsCommentFocused(true)}
                                className="group cursor-pointer"
                              >
                                <div className="bg-brand-dark/20 border border-brand-border rounded-lg px-4 py-2.5 text-text-secondary/70 text-sm hover:border-brand-border/80 transition-all flex items-center justify-between">
                                  <span>Add a comment...</span>
                                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-[10px] text-text-secondary/50 font-mono bg-brand-dark/30 px-1.5 py-0.5 rounded border border-brand-border/20">
                                      Press M to comment
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 mt-2">
                                  <button type="button" className="text-[11px] px-2.5 py-1 rounded bg-brand-dark/30 border border-brand-border/20 text-text-secondary hover:text-text-primary hover:bg-brand-dark/40 transition-all">Suggest a reply...</button>
                                  <button type="button" className="text-[11px] px-2.5 py-1 rounded bg-brand-dark/30 border border-brand-border/20 text-text-secondary hover:text-text-primary hover:bg-brand-dark/40 transition-all">Status update...</button>
                                  <button type="button" className="text-[11px] px-2.5 py-1 rounded bg-brand-dark/30 border border-brand-border/20 text-text-secondary hover:text-text-primary hover:bg-brand-dark/40 transition-all">Thanks...</button>
                                </div>
                              </div>
                            ) : (
                              <div className="animate-in fade-in zoom-in-98 duration-200">
                                <div className="bg-[#1a1e23] border border-brand-border/80 rounded-lg overflow-hidden focus-within:border-brand/50 transition-all shadow-lg ring-1 ring-black/20">
                                  {/* Toolbar */}
                                  <div className="h-10 border-b border-brand-border/30 px-2 flex items-center gap-0.5 bg-brand-dark/5">
                                    <div className="flex items-center gap-0.5 pr-2 mr-2 border-r border-brand-border/20">
                                      <button type="button" onClick={() => insertStyle('bold')} className="p-1.5 rounded hover:bg-brand-dark/40 text-text-secondary hover:text-text-primary transition-all" title="Bold">
                                        <Bold className="w-4 h-4" />
                                      </button>
                                      <button type="button" onClick={() => insertStyle('italic')} className="p-1.5 rounded hover:bg-brand-dark/40 text-text-secondary hover:text-text-primary transition-all" title="Italic">
                                        <Italic className="w-4 h-4" />
                                      </button>
                                    </div>
                                    
                                    <div className="flex items-center gap-0.5 pr-2 mr-2 border-r border-brand-border/20">
                                      <button type="button" onClick={() => insertStyle('list')} className="p-1.5 rounded hover:bg-brand-dark/40 text-text-secondary hover:text-text-primary transition-all" title="Bullet List">
                                        <List className="w-4 h-4" />
                                      </button>
                                      <button type="button" onClick={() => insertStyle('ordered-list')} className="p-1.5 rounded hover:bg-brand-dark/40 text-text-secondary hover:text-text-primary transition-all" title="Numbered List">
                                        <ListOrdered className="w-4 h-4" />
                                      </button>
                                    </div>

                                    <button type="button" onClick={() => insertStyle('code')} className="p-1.5 rounded hover:bg-brand-dark/40 text-text-secondary hover:text-text-primary transition-all" title="Code Block">
                                      <Code2 className="w-4 h-4" />
                                    </button>
                                    
                                    <div className="flex items-center gap-0.5 ml-auto">
                                      <button 
                                        type="button"
                                        onClick={() => {
                                          setUploadTarget('main');
                                          fileInputRef.current?.click();
                                        }} 
                                        className="p-1.5 rounded hover:bg-brand-dark/40 text-text-secondary hover:text-text-primary transition-all" 
                                        title="Attach Files"
                                      >
                                        <Paperclip className="w-4 h-4" />
                                      </button>
                                      <div className="relative group/emojipick">
                                        <button type="button" className="p-1.5 rounded hover:bg-brand-dark/40 text-text-secondary hover:text-text-primary transition-all">
                                          <SmilePlus className="w-4 h-4" />
                                        </button>
                                        <div className="absolute top-full right-0 mt-1 invisible group-hover/emojipick:visible bg-brand-light border border-brand-border rounded-lg shadow-xl p-2 z-50 grid grid-cols-4 gap-1 animate-in zoom-in-95 duration-100">
                                          {['👍', '🔥', '🚀', '✅', '❤️', '👀', '🎉', '💡'].map(e => (
                                            <button 
                                              type="button" 
                                              key={e} 
                                              onClick={() => setNewComment(prev => prev + e)} 
                                              className="p-1.5 hover:bg-brand-dark/30 rounded text-base"
                                            >
                                              {e}
                                            </button>
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <textarea
                                    autoFocus
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    onKeyDown={handleEditorKeyDown}
                                    placeholder="Add a comment... (Type @ to mention)"
                                    rows={4}
                                    className="w-full bg-transparent text-[13px] text-text-primary px-4 py-3 focus:outline-none resize-none custom-scrollbar"
                                  />

                                  {/* Draft Attachments Preview in Main Comment */}
                                  {mainCommentAttachments.length > 0 && (
                                    <div className="px-4 pb-3 flex flex-wrap gap-3 border-t border-brand-border/10 pt-3 mt-1 bg-brand-dark/5">
                                      {mainCommentAttachments.map(att => {
                                        const isImage = att.fileType?.startsWith('image/');
                                        return (
                                          <div key={att.id} className="relative group">
                                            {isImage ? (
                                              <div className="w-16 h-16 rounded overflow-hidden border border-brand-border/50 bg-brand-dark/20 shadow-sm ring-1 ring-black/5">
                                                <img src={getFullUrl(att.fileUrl)} className="w-full h-full object-cover" alt="" />
                                              </div>
                                            ) : (
                                              <div className="flex items-center gap-1.5 px-2 py-1 bg-brand-dark/40 border border-brand-border/30 rounded text-[10px] text-text-secondary h-16">
                                                <FileText className="w-4 h-4 text-brand" />
                                                <span className="truncate max-w-[80px]">{att.fileName}</span>
                                              </div>
                                            )}
                                            <button 
                                              type="button"
                                              onClick={() => setMainCommentAttachments(prev => prev.filter(a => a.id !== att.id))} 
                                              className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center text-[10px] shadow-sm opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-rose-600 border border-white/10"
                                            >
                                              <X className="w-2.5 h-2.5" />
                                            </button>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>

                                <div className="flex items-center justify-end gap-3 mt-3">
                                  <button 
                                    type="button"
                                    onClick={() => {
                                      setIsCommentFocused(false);
                                      setNewComment("");
                                      setMainCommentAttachments([]);
                                    }}
                                    className="text-xs text-text-secondary hover:text-text-primary transition-colors font-medium px-2 py-1"
                                  >
                                    Cancel
                                  </button>
                                  <Button
                                    size="sm"
                                    onClick={handleAddComment}
                                    disabled={!newComment.trim() || commentSubmitting}
                                    leftIcon={<Send className="w-3.5 h-3.5" />}
                                  >
                                    {commentSubmitting ? "Posting..." : "Comment"}
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Comments List (Threaded) */}
                      {comments.length > 0 ? (
                        <div className="space-y-8">
                          {renderComments(comments)}
                        </div>
                      ) : (
                        <p className="text-text-secondary text-sm text-center py-12">
                          No comments yet. Be the first to comment.
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="history-tab-content">
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
            </div>

            {/* Sidebar Details Component (30%) - Independent Scroll */}
            <div className="w-full lg:w-[30%] lg:max-w-sm p-6 lg:p-8 flex-shrink-0 bg-brand-dark/5 dark:bg-white/5 overflow-y-auto custom-scrollbar">
              <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-6">
                Details
              </h3>

              <div className="space-y-6">
                {/* Assignee */}
                <div>
                  <label className="text-xs text-text-secondary mb-1 block">Assignee</label>
                  <div className="relative">
                    <button
                      onClick={() => permissions.canAssign && setShowAssignMenu(!showAssignMenu)}
                      disabled={!permissions.canAssign}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-brand-dark/30 transition-colors text-left ${
                        permissions.canAssign ? "hover:bg-brand-dark/50 cursor-pointer" : "cursor-default opacity-70"
                      }`}
                      title={permissions.canAssign ? "Change assignee" : "You cannot change task assignee"}
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
                      {permissions.canAssign && <ChevronDown className="w-4 h-4 text-text-secondary" />}
                    </button>

                    {showAssignMenu && permissions.canAssign && (
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
                                (task.assigneeId ?? task.assignedToUserId) === userId ? "bg-brand-dark/30" : ""
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
                  {showDueDateMenu && permissions.canEdit ? (
                    <div className="relative">
                      <div className="fixed inset-0 z-10" onClick={() => setShowDueDateMenu(false)} />
                      <div className="absolute left-0 top-full mt-1 w-full bg-brand-light rounded-lg shadow-lg border border-brand-border p-3 z-20">
                        <input
                          type="date"
                          value={editedDueDate}
                          onChange={(e) => setEditedDueDate(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleDueDateChange(editedDueDate);
                            } else if (e.key === "Escape") {
                              setShowDueDateMenu(false);
                              setEditedDueDate(task.dueDate || "");
                            }
                          }}
                          className="w-full px-3 py-2 bg-brand-dark/30 border border-brand-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-brand"
                          autoFocus
                        />
                        <div className="flex justify-end gap-2 mt-2">
                          <button
                            onClick={() => {
                              setShowDueDateMenu(false);
                              setEditedDueDate(task.dueDate || "");
                            }}
                            className="px-3 py-1 text-xs text-text-secondary hover:text-text-primary transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleDueDateChange(editedDueDate)}
                            className="px-3 py-1 text-xs bg-brand text-white rounded hover:bg-brand-hover transition-colors"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg bg-brand-dark/30 ${
                        permissions.canEdit ? "cursor-pointer hover:bg-brand-dark/50" : ""
                      } transition-colors`}
                      onClick={() => permissions.canEdit && setShowDueDateMenu(true)}
                      title={permissions.canEdit ? "Click to edit due date" : undefined}
                    >
                      <Calendar className="w-4 h-4 text-text-secondary" />
                      <span className={`text-sm ${
                        task.dueDate && new Date(task.dueDate) < new Date()
                          ? "text-rose-400"
                          : "text-text-primary"
                      }`}>
                        {formatDate(task.dueDate)}
                      </span>
                      {permissions.canEdit && <ChevronDown className="w-4 h-4 text-text-secondary ml-auto" />}
                    </div>
                  )}
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

                {/* Reporter */}
                <div>
                  <label className="text-xs text-text-secondary mb-1 block">Reporter</label>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-brand-dark/30">
                    <div className="w-5 h-5 rounded-full bg-slate-500/30 flex items-center justify-center text-[10px] font-medium text-text-secondary">
                      {getInitials(task.creator?.name)}
                    </div>
                    <span className="text-sm text-text-primary">{task.creator?.name || 'Unknown'}</span>
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
          confirmText="Delete Task"
          variant="danger"
          loading={formLoading}
        />

        <ConfirmDialog
          isOpen={showDeleteCommentDialog}
          onClose={() => {
              setShowDeleteCommentDialog(false);
              setCommentToDeleteId(null);
          }}
          onConfirm={confirmDeleteComment}
          title="Delete Comment"
          message="Are you sure you want to delete this comment? This action cannot be undone."
          confirmText="Delete"
          cancelText="Keep Comment"
          variant="danger"
          loading={commentSubmitting}
        />
        </div>
      </div>
    </>
  );
};

export default TaskDetail;
