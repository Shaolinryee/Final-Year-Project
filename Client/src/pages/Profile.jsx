/**
 * Profile Page
 * User profile settings and preferences
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Shield,
  Calendar,
  Edit2,
  LogOut,
  FolderKanban,
  ListTodo,
  Activity,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { usersApi, projectsApi, membersApi, tasksApi } from "../services/api";
import { Button } from "../components/ui";

const Profile = () => {
  const navigate = useNavigate();
  const { user: authUser, logout } = useAuth();
  const [mockUser, setMockUser] = useState(null);
  const [stats, setStats] = useState({ projects: 0, tasks: 0, owned: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    setLoading(true);

    // Get mock user data
    const { data: user } = await usersApi.getCurrent();
    setMockUser(user);

    // Calculate stats
    const { data: projects } = await projectsApi.getAll();
    let memberCount = 0;
    let ownerCount = 0;
    let taskCount = 0;

    for (const project of projects || []) {
      const { data: members } = await membersApi.getByProject(project.id);
      const membership = members?.find((m) => m.userId === user?.id);
      
      if (membership) {
        memberCount++;
        if (membership.role === "owner") ownerCount++;
        
        const { data: tasks } = await tasksApi.getByProject(project.id);
        const assigned = tasks?.filter((t) => t.assignedToUserId === user?.id) || [];
        taskCount += assigned.length;
      }
    }

    setStats({ projects: memberCount, tasks: taskCount, owned: ownerCount });
    setLoading(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-48 bg-brand-light rounded-xl animate-pulse" />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-brand-light rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Profile</h1>
        <p className="text-text-secondary mt-1">Manage your account settings</p>
      </div>

      {/* Profile Card */}
      <div className="rounded-xl bg-brand-light border border-brand-border overflow-hidden">
        {/* Banner */}
        <div className="h-24 bg-gradient-to-r from-indigo-600 to-purple-600" />
        
        {/* Profile Info */}
        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 border-4 border-white dark:border-gray-950 flex items-center justify-center text-white text-2xl font-bold">
              {getInitials(mockUser?.name)}
            </div>

            {/* Name & Actions */}
            <div className="flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
              <div>
                <h2 className="text-xl font-bold text-text-primary">
                  {mockUser?.name || "User"}
                </h2>
                <p className="text-text-secondary">{authUser?.email || mockUser?.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Edit2 className="w-4 h-4" />}
                  disabled
                >
                  Edit Profile
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                >
                  <LogOut className="w-4 h-4 mr-1.5" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl bg-brand-light border border-brand-border">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-indigo-500/20">
              <FolderKanban className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">{stats.projects}</p>
              <p className="text-sm text-text-secondary">Projects</p>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-brand-light border border-brand-border">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-emerald-500/20">
              <ListTodo className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">{stats.tasks}</p>
              <p className="text-sm text-text-secondary">Assigned Tasks</p>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-brand-light border border-brand-border">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-amber-500/20">
              <Shield className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">{stats.owned}</p>
              <p className="text-sm text-text-secondary">Projects Owned</p>
            </div>
          </div>
        </div>
      </div>

      {/* Account Info */}
      <div className="rounded-xl bg-brand-light border border-brand-border divide-y divide-brand-border">
        <div className="px-6 py-4">
          <h3 className="font-semibold text-text-primary">Account Information</h3>
        </div>

        <div className="px-6 py-4 flex items-center gap-4">
          <Mail className="w-5 h-5 text-text-secondary" />
          <div className="flex-1">
            <p className="text-sm text-text-secondary">Email</p>
            <p className="text-text-primary">{authUser?.email || mockUser?.email}</p>
          </div>
        </div>

        <div className="px-6 py-4 flex items-center gap-4">
          <User className="w-5 h-5 text-text-secondary" />
          <div className="flex-1">
            <p className="text-sm text-text-secondary">Display Name</p>
            <p className="text-text-primary">{mockUser?.name || "Not set"}</p>
          </div>
        </div>

        <div className="px-6 py-4 flex items-center gap-4">
          <Calendar className="w-5 h-5 text-text-secondary" />
          <div className="flex-1">
            <p className="text-sm text-text-secondary">Member Since</p>
            <p className="text-text-primary">
              {mockUser?.createdAt
                ? new Date(mockUser.createdAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })
                : "Unknown"}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-xl bg-brand-light border border-brand-border">
        <div className="px-6 py-4 border-b border-brand-border">
          <h3 className="font-semibold text-text-primary">Quick Actions</h3>
        </div>
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={() => navigate("/my-tasks")}
            className="flex items-center gap-3 p-4 rounded-lg bg-brand-dark/5 dark:bg-white/5 hover:bg-brand-dark/10 dark:hover:bg-white/10 transition-colors text-left"
          >
            <ListTodo className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <div>
              <p className="font-medium text-text-primary">View My Tasks</p>
              <p className="text-sm text-text-secondary">See all assigned tasks</p>
            </div>
          </button>
          <button
            onClick={() => navigate("/invitations")}
            className="flex items-center gap-3 p-4 rounded-lg bg-brand-dark/5 dark:bg-white/5 hover:bg-brand-dark/10 dark:hover:bg-white/10 transition-colors text-left"
          >
            <Mail className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <div>
              <p className="font-medium text-text-primary">Check Invitations</p>
              <p className="text-sm text-text-secondary">Review pending invites</p>
            </div>
          </button>
          <button
            onClick={() => navigate("/activity")}
            className="flex items-center gap-3 p-4 rounded-lg bg-brand-dark/5 dark:bg-white/5 hover:bg-brand-dark/10 dark:hover:bg-white/10 transition-colors text-left"
          >
            <Activity className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <div>
              <p className="font-medium text-text-primary">Recent Activity</p>
              <p className="text-sm text-text-secondary">See what's happening</p>
            </div>
          </button>
          <button
            onClick={() => navigate("/projects")}
            className="flex items-center gap-3 p-4 rounded-lg bg-brand-dark/5 dark:bg-white/5 hover:bg-brand-dark/10 dark:hover:bg-white/10 transition-colors text-left"
          >
            <FolderKanban className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <div>
              <p className="font-medium text-text-primary">Browse Projects</p>
              <p className="text-sm text-text-secondary">View all your projects</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
