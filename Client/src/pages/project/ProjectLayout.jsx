/**
 * ProjectLayout - Shared layout for all project routes
 * Provides project context and handles loading/error states
 */

import { useState, useEffect, useCallback, createContext, useContext, useMemo } from "react";
import { useParams, Outlet, Navigate, useNavigate } from "react-router-dom";
import {
  projectsApi,
  tasksApi,
  membersApi,
  invitationsApi,
  activityApi,
  usersApi,
} from "../../services/api";
import { TaskItemSkeleton, Button } from "../../components/ui";
import { useSocket } from "../../context/SocketContext";
import { getUserRole, isOwner as checkIsOwner, isAdmin as checkIsAdmin } from "../../utils/permissions";

// Project Context
const ProjectContext = createContext(null);

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error("useProject must be used within ProjectLayout");
  }
  return context;
};

export const useProjectOptional = () => useContext(ProjectContext);

const ProjectLayout = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { socket, joinProject, leaveProject } = useSocket();

  // Current user
  const [currentUser, setCurrentUser] = useState(null);

  // Project state
  const [project, setProject] = useState(null);
  const [projectLoading, setProjectLoading] = useState(true);
  const [projectError, setProjectError] = useState(null);

  // Tasks state
  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(true);

  // Members state
  const [members, setMembers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(true);

  // Invitations state
  const [invitations, setInvitations] = useState([]);
  const [invitationsLoading, setInvitationsLoading] = useState(true);

  // Activity state
  const [activities, setActivities] = useState([]);
  const [activityLoading, setActivityLoading] = useState(true);

  // Check if current user is owner
  const isOwner = useMemo(() => {
    if (!currentUser || members.length === 0) return false;
    const membership = members.find((m) => m.userId === currentUser.id);
    return membership?.role === "owner";
  }, [currentUser, members]);

  // Get current user's role in this project
  const userRole = useMemo(() => {
    if (!currentUser || members.length === 0) return null;
    return getUserRole(members, currentUser.id);
  }, [currentUser, members]);

  // Check if current user is admin
  const isAdmin = useMemo(() => {
    return checkIsAdmin(userRole);
  }, [userRole]);

  // Fetch current user
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const { data } = await usersApi.getCurrent();
      if (data) setCurrentUser(data);
    };
    fetchCurrentUser();
  }, []);

  // Fetch project
  const fetchProject = useCallback(async () => {
    setProjectLoading(true);
    setProjectError(null);

    const { data, error } = await projectsApi.getById(projectId);

    if (error) {
      setProjectError(error);
    } else {
      setProject(data);
    }

    setProjectLoading(false);
  }, [projectId]);

  // Fetch tasks
  const fetchTasks = useCallback(async () => {
    setTasksLoading(true);
    const { data } = await tasksApi.getByProject(projectId);
    setTasks(data || []);
    setTasksLoading(false);
  }, [projectId]);

  // Fetch members
  const fetchMembers = useCallback(async () => {
    setMembersLoading(true);
    const { data } = await membersApi.getByProject(projectId);
    setMembers(data || []);
    setMembersLoading(false);
  }, [projectId]);

  // Fetch invitations
  const fetchInvitations = useCallback(async () => {
    setInvitationsLoading(true);
    const { data } = await invitationsApi.getByProject(projectId, "pending");
    setInvitations(data || []);
    setInvitationsLoading(false);
  }, [projectId]);

  // Fetch activity
  const fetchActivity = useCallback(async () => {
    setActivityLoading(true);
    const { data } = await activityApi.getByProject(projectId, { limit: 50 });
    setActivities(data || []);
    setActivityLoading(false);
  }, [projectId]);

  // Initial data fetch and socket room management
  useEffect(() => {
    if (projectId) {
      fetchProject();
      fetchTasks();
      fetchMembers();
      fetchInvitations();
      fetchActivity();

      // Join room for real-time updates
      joinProject(projectId);

      return () => {
        leaveProject(projectId);
      };
    }
  }, [projectId, fetchProject, fetchTasks, fetchMembers, fetchInvitations, fetchActivity, joinProject, leaveProject]);

  // Socket event listeners
  useEffect(() => {
    if (socket && projectId) {
      const handleTaskCreated = (data) => {
        if (data.userId === currentUser?.id) return;
        setTasks((prev) => [data.task, ...prev]);
      };

      const handleTaskUpdated = (data) => {
        if (data.userId === currentUser?.id) return;
        setTasks((prev) => prev.map((t) => (t.id === data.task.id ? data.task : t)));
      };

      const handleTaskDeleted = (data) => {
        if (data.userId === currentUser?.id) return;
        setTasks((prev) => prev.filter((t) => t.id !== data.taskId));
      };

      const handleProjectUpdated = (data) => {
        if (data.userId === currentUser?.id) return;
        setProject(data.project);
      };

      const handleProjectDeleted = (data) => {
        if (data.projectId === projectId) {
          navigate("/projects", { state: { message: "Project was deleted by owner" } });
        }
      };

      const handleCommentCreated = (data) => {
        if (data.userId === currentUser?.id) return;
        setTasks((prev) => prev.map(t => {
          if (t.id === data.taskId) {
            const comments = t.comments || [];
            if (comments.some(c => c.id === data.comment.id)) return t;
            return { ...t, comments: [...comments, data.comment] };
          }
          return t;
        }));
      };

      const handleCommentDeleted = (data) => {
        if (data.userId === currentUser?.id) return;
        setTasks((prev) => prev.map(t => {
          if (t.id === data.taskId) {
            return { ...t, comments: (t.comments || []).filter(c => c.id !== data.commentId) };
          }
          return t;
        }));
      };

      const handleAttachmentCreated = (data) => {
        if (data.userId === currentUser?.id) return;
        setTasks((prev) => prev.map(t => {
          if (t.id === data.taskId) {
            const attachments = t.attachments || [];
            if (attachments.some(a => a.id === data.attachment.id)) return t;
            return { ...t, attachments: [data.attachment, ...attachments] };
          }
          return t;
        }));
      };

      const handleAttachmentDeleted = (data) => {
        if (data.userId === currentUser?.id) return;
        setTasks((prev) => prev.map(t => {
          if (t.id === data.taskId) {
            return { ...t, attachments: (t.attachments || []).filter(a => a.id !== data.attachmentId) };
          }
          return t;
        }));
      };

      socket.on('task_created', handleTaskCreated);
      socket.on('task_updated', handleTaskUpdated);
      socket.on('task_deleted', handleTaskDeleted);
      socket.on('project_updated', handleProjectUpdated);
      socket.on('project_deleted', handleProjectDeleted);
      socket.on('comment_created', handleCommentCreated);
      socket.on('comment_deleted', handleCommentDeleted);
      socket.on('attachment_created', handleAttachmentCreated);
      socket.on('attachment_deleted', handleAttachmentDeleted);

      return () => {
        socket.off('task_created', handleTaskCreated);
        socket.off('task_updated', handleTaskUpdated);
        socket.off('task_deleted', handleTaskDeleted);
        socket.off('project_updated', handleProjectUpdated);
        socket.off('project_deleted', handleProjectDeleted);
        socket.off('comment_created', handleCommentCreated);
        socket.off('comment_deleted', handleCommentDeleted);
        socket.off('attachment_created', handleAttachmentCreated);
        socket.off('attachment_deleted', handleAttachmentDeleted);
      };
    }
  }, [socket, projectId, currentUser?.id, navigate]);

  // Context value
  const contextValue = useMemo(
    () => ({
      // Data
      project,
      tasks,
      members,
      invitations,
      activities,
      currentUser,
      isOwner,
      isAdmin,
      userRole,
      projectId,
      // Loading states
      projectLoading,
      tasksLoading,
      membersLoading,
      invitationsLoading,
      activityLoading,
      // Setters
      setProject,
      setTasks,
      setMembers,
      setInvitations,
      setActivities,
      // Refetch functions
      fetchProject,
      fetchTasks,
      fetchMembers,
      fetchInvitations,
      fetchActivity,
    }),
    [
      project,
      tasks,
      members,
      invitations,
      activities,
      currentUser,
      isOwner,
      isAdmin,
      userRole,
      projectId,
      projectLoading,
      tasksLoading,
      membersLoading,
      invitationsLoading,
      activityLoading,
      fetchProject,
      fetchTasks,
      fetchMembers,
      fetchInvitations,
      fetchActivity,
    ]
  );

  return (
    <ProjectContext.Provider value={contextValue}>
      {/* Loading state */}
      {projectLoading ? (
        <div className="space-y-6">
          <div className="h-8 w-48 bg-white/5 rounded animate-pulse" />
          <div className="h-6 w-96 bg-white/5 rounded animate-pulse" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-white/5 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      ) : projectError || !project ? (
        /* Error state */
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-white mb-2">
            {projectError || "Project not found"}
          </h2>
          <Button onClick={() => navigate("/projects")}>Back to Projects</Button>
        </div>
      ) : (
        <Outlet />
      )}
    </ProjectContext.Provider>
  );
};

export default ProjectLayout;
