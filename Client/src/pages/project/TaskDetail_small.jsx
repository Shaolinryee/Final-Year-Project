/**
 * TaskDetail - Jira-style task detail panel
 * Opens as a slide-in panel from the right side
 */

import { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
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
    label: "Support",
    color: "text-cyan-400",
    bgColor: "bg-cyan-500/20",
  },
};

const priorityConfig = {
  low: { label: "Low", color: "text-gray-400", bgColor: "bg-gray-500/20" },
  medium: { label: "Medium", color: "text-amber-400", bgColor: "bg-amber-500/20" },
  high: { label: "High", color: "text-rose-400", bgColor: "bg-rose-500/20" },
};

const TaskDetail = () => {
  const { taskId, projectId: routeProjectId } = useParams();
  const navigate = useNavigate();
  const projectContext = useProjectOptional();

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
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedDescription, setEditedDescription] = useState("");

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
    }
  }, [task]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && !previewAttachment && !isEditOpen && !isDeleteOpen) {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [previewAttachment, isEditOpen, isDeleteOpen, navigate, projectId]);

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
    // Find either the reply textarea or the main one
    const textarea = document.querySelector('textarea:focus') || document.querySelector('textarea[autoFocus]');
    if (!textarea) return;

    const isReplyInput = textarea.placeholder.includes('Reply to') || textarea.closest('.ml-8');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = isReplyInput ? replyText : newComment;
    const before = text.substring(0, start);
    const after = text.substring(end);
    const selected = text.substring(start, end);

    let newText = text;
    let cursorOffset = 0;

    switch (styleType) {
      case 'bold':
        newText = `${before}**${selected || 'bold text'}**${after}`;
        cursorOffset = start + 2;
        break;
      case 'italic':
        newText = `${before}_${selected || 'italic text'}_${after}`;
        cursorOffset = start + 1;
        break;
      case 'list':
        newText = `${before}\n- ${selected || 'list item'}${after}`;
        cursorOffset = start + 3;
        break;
      case 'code':
        newText = `${before}\`\`\`\n${selected || 'code snippet'}\n\`\`\`${after}`;
        cursorOffset = start + 4;
        break;
      default:
        break;
    }

    if (isReplyInput) {
      setReplyText(newText);
    } else {
      setNewComment(newText);
    }

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(cursorOffset, cursorOffset + (selected.length || 10));
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
                  >
                    <span className="flex items-center gap-2">
                      <History className="w-4 h-4" />
                      History
                    </span>
                  </button>
                </div>

                <div className="mt-8">
                  {activeTab === "comments" ? (
                  <div>
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

            {/* Sidebar Details Component (30%) */}
            <div className="w-full lg:w-[30%] lg:max-w-sm p-6 lg:p-8 flex-shrink-0 bg-brand-dark/5 dark:bg-white/5">
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
