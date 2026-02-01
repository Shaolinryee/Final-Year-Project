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

const ProjectLayout = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();

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

  // Initial data fetch
  useEffect(() => {
    fetchProject();
    fetchTasks();
    fetchMembers();
    fetchInvitations();
    fetchActivity();
  }, [fetchProject, fetchTasks, fetchMembers, fetchInvitations, fetchActivity]);

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

  // Loading state
  if (projectLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-white/5 rounded animate-pulse" />
        <div className="h-6 w-96 bg-white/5 rounded animate-pulse" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (projectError || !project) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-white mb-2">
          {projectError || "Project not found"}
        </h2>
        <Button onClick={() => navigate("/projects")}>Back to Projects</Button>
      </div>
    );
  }

  return (
    <ProjectContext.Provider value={contextValue}>
      <Outlet />
    </ProjectContext.Provider>
  );
};

export default ProjectLayout;
