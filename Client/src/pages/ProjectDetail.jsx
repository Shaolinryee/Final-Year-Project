/**
 * ProjectDetail Page
 * Shows project details with tabs for Tasks, Members, and Activity
 */

import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Edit2,
  Trash2,
  ListTodo,
  Clock,
  CheckCircle2,
  Users,
  Activity,
  UserPlus,
} from "lucide-react";
import {
  projectsApi,
  tasksApi,
  membersApi,
  invitationsApi,
  activityApi,
  usersApi,
} from "../services/api";
import {
  Button,
  Alert,
  EmptyState,
  ConfirmDialog,
  StatusPill,
  TaskItemSkeleton,
} from "../components/ui";
import { ProjectFormModal } from "../components/projects";
import { TaskItem, TaskFormModal } from "../components/tasks";
import { MemberRow, InviteMemberModal, PendingInvites } from "../components/members";
import { ActivityFeed } from "../components/activity";

// Tab configuration
const TABS = [
  { key: "tasks", label: "Tasks", icon: ListTodo },
  { key: "members", label: "Members", icon: Users },
  { key: "activity", label: "Activity", icon: Activity },
];

const ProjectDetail = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Active tab from URL or default to tasks
  const activeTab = searchParams.get("tab") || "tasks";
  const setActiveTab = (tab) => {
    setSearchParams({ tab });
  };

  // Current user (mock - in real app, get from auth context)
  const [currentUser, setCurrentUser] = useState(null);

  // Project state
  const [project, setProject] = useState(null);
  const [projectLoading, setProjectLoading] = useState(true);
  const [projectError, setProjectError] = useState(null);

  // Tasks state
  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [taskError, setTaskError] = useState(null);

  // Members state
  const [members, setMembers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [membersError, setMembersError] = useState(null);

  // Invitations state
  const [invitations, setInvitations] = useState([]);
  const [invitationsLoading, setInvitationsLoading] = useState(false);

  // Activity state
  const [activities, setActivities] = useState([]);
  const [activityLoading, setActivityLoading] = useState(false);

  // Check if current user is owner
  const isOwner = useMemo(() => {
    if (!currentUser || members.length === 0) return false;
    const membership = members.find((m) => m.userId === currentUser.id);
    return membership?.role === "owner";
  }, [currentUser, members]);

  // Filter state for tasks
  const [statusFilter, setStatusFilter] = useState("all");

  // Modal states
  const [isProjectFormOpen, setIsProjectFormOpen] = useState(false);
  const [isProjectDeleteOpen, setIsProjectDeleteOpen] = useState(false);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [isTaskDeleteOpen, setIsTaskDeleteOpen] = useState(false);
  const [deletingTask, setDeletingTask] = useState(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteError, setInviteError] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

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
    setTaskError(null);

    const { data, error } = await tasksApi.getByProject(projectId);

    if (error) {
      setTaskError(error);
    } else {
      setTasks(data || []);
    }

    setTasksLoading(false);
  }, [projectId]);

  // Fetch members
  const fetchMembers = useCallback(async () => {
    setMembersLoading(true);
    setMembersError(null);

    const { data, error } = await membersApi.getByProject(projectId);

    if (error) {
      setMembersError(error);
    } else {
      setMembers(data || []);
    }

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
  }, [fetchProject, fetchTasks, fetchMembers]);

  // Fetch tab-specific data
  useEffect(() => {
    if (activeTab === "members") {
      fetchInvitations();
    } else if (activeTab === "activity") {
      fetchActivity();
    }
  }, [activeTab, fetchInvitations, fetchActivity]);

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    if (statusFilter === "all") return tasks;

    return tasks.filter((task) => {
      const taskStatus = task.status?.toLowerCase().replace("-", "_") || "todo";
      return taskStatus === statusFilter;
    });
  }, [tasks, statusFilter]);

  // Task counts
  const taskCounts = useMemo(() => {
    return {
      all: tasks.length,
      todo: tasks.filter((t) => t.status?.toUpperCase() === "TODO").length,
      in_progress: tasks.filter((t) => t.status?.toUpperCase() === "IN_PROGRESS").length,
      completed: tasks.filter((t) => {
        const s = t.status?.toUpperCase();
        return s === "COMPLETED" || s === "DONE";
      }).length,
    };
  }, [tasks]);

  // ==================== Project Handlers ====================

  const handleProjectUpdate = async (formData) => {
    setFormLoading(true);
    setProjectError(null);

    try {
      const { data, error } = await projectsApi.update(projectId, formData);
      if (error) throw new Error(error);

      setProject(data);
      setIsProjectFormOpen(false);
    } catch (err) {
      setProjectError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleProjectDelete = async () => {
    setFormLoading(true);

    try {
      const { error } = await projectsApi.delete(projectId);
      if (error) throw new Error(error);

      navigate("/projects");
    } catch (err) {
      setProjectError(err.message);
      setIsProjectDeleteOpen(false);
    } finally {
      setFormLoading(false);
    }
  };

  // ==================== Task Handlers ====================

  const handleCreateTask = () => {
    setEditingTask(null);
    setIsTaskFormOpen(true);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setIsTaskFormOpen(true);
  };

  const handleDeleteTaskClick = (task) => {
    setDeletingTask(task);
    setIsTaskDeleteOpen(true);
  };

  const handleTaskFormSubmit = async (formData) => {
    setFormLoading(true);
    setTaskError(null);

    try {
      if (editingTask) {
        const { data, error } = await tasksApi.update(editingTask.id, formData);
        if (error) throw new Error(error);

        setTasks((prev) =>
          prev.map((t) => (t.id === editingTask.id ? data : t))
        );
      } else {
        const { data, error } = await tasksApi.create(projectId, formData);
        if (error) throw new Error(error);

        setTasks((prev) => [...prev, data]);
      }

      setIsTaskFormOpen(false);
      setEditingTask(null);
    } catch (err) {
      setTaskError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleTaskStatusChange = async (taskId, newStatus) => {
    setTaskError(null);

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
      setTaskError(err.message);
    }
  };

  const handleTaskAssign = async (taskId, userId) => {
    setTaskError(null);

    // Find user for optimistic update
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
      const { data, error } = await tasksApi.assign(taskId, userId);
      if (error) throw new Error(error);

      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? data : t))
      );
    } catch (err) {
      fetchTasks();
      setTaskError(err.message);
    }
  };

  const handleTaskDeleteConfirm = async () => {
    if (!deletingTask) return;

    setFormLoading(true);
    setTaskError(null);

    try {
      const { error } = await tasksApi.delete(deletingTask.id);
      if (error) throw new Error(error);

      setTasks((prev) => prev.filter((t) => t.id !== deletingTask.id));
      setIsTaskDeleteOpen(false);
      setDeletingTask(null);
    } catch (err) {
      setTaskError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  // ==================== Member Handlers ====================

  const handleInviteMember = async ({ email, role }) => {
    setFormLoading(true);
    setInviteError(null);

    try {
      const { data, error } = await invitationsApi.create(projectId, email, role);
      if (error) throw new Error(error);

      setInvitations((prev) => [...prev, data]);
      setIsInviteModalOpen(false);
    } catch (err) {
      setInviteError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleRevokeInvitation = async (invitationId) => {
    try {
      const { error } = await invitationsApi.revoke(invitationId);
      if (error) throw new Error(error);

      setInvitations((prev) => prev.filter((inv) => inv.id !== invitationId));
    } catch (err) {
      setMembersError(err.message);
    }
  };

  const handleAcceptInvitation = async (invitationId) => {
    try {
      const { error } = await invitationsApi.accept(invitationId);
      if (error) throw new Error(error);

      // Refresh members and invitations
      fetchMembers();
      fetchInvitations();
    } catch (err) {
      setMembersError(err.message);
    }
  };

  const handleDeclineInvitation = async (invitationId) => {
    try {
      const { error } = await invitationsApi.decline(invitationId);
      if (error) throw new Error(error);

      setInvitations((prev) => prev.filter((inv) => inv.id !== invitationId));
    } catch (err) {
      setMembersError(err.message);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    setMembersError(null);

    try {
      const { data, error } = await membersApi.updateRole(projectId, userId, newRole);
      if (error) throw new Error(error);

      setMembers((prev) =>
        prev.map((m) => (m.userId === userId ? { ...m, role: newRole } : m))
      );
    } catch (err) {
      setMembersError(err.message);
    }
  };

  const handleRemoveMember = async (userId) => {
    setMembersError(null);

    try {
      const { error } = await membersApi.remove(projectId, userId);
      if (error) throw new Error(error);

      setMembers((prev) => prev.filter((m) => m.userId !== userId));
    } catch (err) {
      setMembersError(err.message);
    }
  };

  // ==================== Render Loading/Error ====================

  if (projectLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="h-6 w-96 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <TaskItemSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (projectError || !project) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          {projectError || "Project not found"}
        </h2>
        <Button onClick={() => navigate("/projects")}>Back to Projects</Button>
      </div>
    );
  }

  // ==================== Render Tabs Content ====================

  const renderTasksTab = () => (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Tasks</h2>
        <Button
          onClick={handleCreateTask}
          size="sm"
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Add Task
        </Button>
      </div>

      {/* Task Filters */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
        {[
          { key: "all", label: "All", icon: ListTodo },
          { key: "todo", label: "To Do", icon: ListTodo },
          { key: "in_progress", label: "In Progress", icon: Clock },
          { key: "completed", label: "Completed", icon: CheckCircle2 },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setStatusFilter(key)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              statusFilter === key
                ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400"
                : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
            <span className="ml-1 text-xs">({taskCounts[key]})</span>
          </button>
        ))}
      </div>

      {/* Tasks List */}
      {tasksLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <TaskItemSkeleton key={i} />
          ))}
        </div>
      ) : filteredTasks.length === 0 ? (
        <EmptyState
          icon={ListTodo}
          title={statusFilter !== "all" ? `No ${statusFilter.replace("_", " ")} tasks` : "No tasks yet"}
          description={
            statusFilter !== "all"
              ? "Try selecting a different filter"
              : "Create your first task to get started"
          }
          actionLabel={statusFilter === "all" ? "Add Task" : undefined}
          onAction={statusFilter === "all" ? handleCreateTask : undefined}
        />
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              members={members}
              onStatusChange={handleTaskStatusChange}
              onEdit={handleEditTask}
              onDelete={handleDeleteTaskClick}
              onAssign={handleTaskAssign}
            />
          ))}
        </div>
      )}
    </div>
  );

  const renderMembersTab = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Members ({members.length})
        </h2>
        {isOwner && (
          <Button
            onClick={() => setIsInviteModalOpen(true)}
            size="sm"
            leftIcon={<UserPlus className="w-4 h-4" />}
          >
            Invite Member
          </Button>
        )}
      </div>

      {/* Error */}
      {membersError && (
        <Alert
          variant="error"
          message={membersError}
          onDismiss={() => setMembersError(null)}
        />
      )}

      {/* Members List */}
      {membersLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : members.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No members"
          description="This project has no members yet"
        />
      ) : (
        <div className="space-y-3">
          {members.map((member) => (
            <MemberRow
              key={member.userId}
              member={member}
              currentUserId={currentUser?.id}
              isCurrentUserOwner={isOwner}
              onRoleChange={handleRoleChange}
              onRemove={handleRemoveMember}
              loading={formLoading}
            />
          ))}
        </div>
      )}

      {/* Pending Invitations */}
      {invitations.length > 0 && (
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <PendingInvites
            invitations={invitations}
            isOwner={isOwner}
            currentUserEmail={currentUser?.email}
            onRevoke={handleRevokeInvitation}
            onAccept={handleAcceptInvitation}
            onDecline={handleDeclineInvitation}
            loading={invitationsLoading}
          />
        </div>
      )}
    </div>
  );

  const renderActivityTab = () => (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Activity</h2>
      <ActivityFeed
        activities={activities}
        loading={activityLoading}
        onRefresh={fetchActivity}
      />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        onClick={() => navigate("/projects")}
        className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Projects
      </button>

      {/* Project Header */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {project.name}
              </h1>
              <span className="text-sm font-mono text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                {project.key}
              </span>
              <StatusPill status={project.status || "active"} />
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              {project.description || "No description"}
            </p>
          </div>
          {isOwner && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsProjectFormOpen(true)}
                leftIcon={<Edit2 className="w-4 h-4" />}
              >
                Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsProjectDeleteOpen(true)}
                className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-900/20"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Error Alerts */}
      {projectError && (
        <Alert
          variant="error"
          message={projectError}
          onDismiss={() => setProjectError(null)}
        />
      )}
      {taskError && (
        <Alert
          variant="error"
          message={taskError}
          onDismiss={() => setTaskError(null)}
        />
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex gap-4">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`inline-flex items-center gap-2 px-4 py-3 border-b-2 text-sm font-medium transition-colors ${
                activeTab === key
                  ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
              {key === "members" && members.length > 0 && (
                <span className="text-xs px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700">
                  {members.length}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "tasks" && renderTasksTab()}
        {activeTab === "members" && renderMembersTab()}
        {activeTab === "activity" && renderActivityTab()}
      </div>

      {/* Modals */}
      <ProjectFormModal
        isOpen={isProjectFormOpen}
        onClose={() => setIsProjectFormOpen(false)}
        onSubmit={handleProjectUpdate}
        project={project}
        loading={formLoading}
      />

      <ConfirmDialog
        isOpen={isProjectDeleteOpen}
        onClose={() => setIsProjectDeleteOpen(false)}
        onConfirm={handleProjectDelete}
        title="Delete Project"
        message={`Are you sure you want to delete "${project.name}"? This will also delete all ${tasks.length} task(s) in this project. This action cannot be undone.`}
        confirmText="Delete"
        loading={formLoading}
      />

      <TaskFormModal
        isOpen={isTaskFormOpen}
        onClose={() => {
          setIsTaskFormOpen(false);
          setEditingTask(null);
        }}
        onSubmit={handleTaskFormSubmit}
        task={editingTask}
        loading={formLoading}
      />

      <ConfirmDialog
        isOpen={isTaskDeleteOpen}
        onClose={() => {
          setIsTaskDeleteOpen(false);
          setDeletingTask(null);
        }}
        onConfirm={handleTaskDeleteConfirm}
        title="Delete Task"
        message={`Are you sure you want to delete "${deletingTask?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        loading={formLoading}
      />

      <InviteMemberModal
        isOpen={isInviteModalOpen}
        onClose={() => {
          setIsInviteModalOpen(false);
          setInviteError(null);
        }}
        onSubmit={handleInviteMember}
        loading={formLoading}
        error={inviteError}
      />
    </div>
  );
};

export default ProjectDetail;
