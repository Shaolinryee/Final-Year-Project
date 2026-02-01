/**
 * Dashboard Page
 * Overview with quick stats and recent projects
 */

import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  FolderKanban,
  CheckCircle2,
  Clock,
  Plus,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { projectsApi, tasksApi } from "../services/api";
import { Button, Alert, StatusPill, ProjectCardSkeleton } from "../components/ui";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    completedTasks: 0,
    inProgressTasks: 0,
  });
  const [recentProjects, setRecentProjects] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch projects
      const { data: projects, error: projectsError } = await projectsApi.getAll();
      if (projectsError) throw new Error(projectsError);

      // Get recent projects (top 5, sorted by createdAt)
      const sorted = [...projects].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setRecentProjects(sorted.slice(0, 5));

      // Calculate project stats
      const activeProjects = projects.filter((p) => p.status === "active").length;

      // Fetch tasks for all projects to calculate task stats
      let completedTasks = 0;
      let inProgressTasks = 0;

      for (const project of projects) {
        const { data: tasks } = await tasksApi.getByProject(project.id);
        if (tasks) {
          completedTasks += tasks.filter((t) => 
            t.status?.toUpperCase() === "COMPLETED" || t.status?.toUpperCase() === "DONE"
          ).length;
          inProgressTasks += tasks.filter((t) => 
            t.status?.toUpperCase() === "IN_PROGRESS"
          ).length;
        }
      }

      setStats({
        totalProjects: projects.length,
        activeProjects,
        completedTasks,
        inProgressTasks,
      });
    } catch (err) {
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            {getGreeting()}! 👋
          </h1>
          <p className="text-text-secondary mt-1">
            Here's what's happening with your projects
          </p>
        </div>
        <Button
          onClick={() => navigate("/projects")}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Create Project
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert
          variant="error"
          title="Error loading dashboard"
          message={error}
          onDismiss={() => setError(null)}
        />
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Projects"
          value={stats.totalProjects}
          icon={FolderKanban}
          color="indigo"
          loading={loading}
        />
        <StatCard
          title="Active Projects"
          value={stats.activeProjects}
          icon={TrendingUp}
          color="emerald"
          loading={loading}
        />
        <StatCard
          title="In Progress"
          value={stats.inProgressTasks}
          icon={Clock}
          color="amber"
          loading={loading}
        />
        <StatCard
          title="Completed Tasks"
          value={stats.completedTasks}
          icon={CheckCircle2}
          color="blue"
          loading={loading}
        />
      </div>

      {/* Recent Projects */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-text-primary">
            Recent Projects
          </h2>
          <Link
            to="/projects"
            className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            View all
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <ProjectCardSkeleton key={i} />
            ))}
          </div>
        ) : recentProjects.length === 0 ? (
          <div className="rounded-xl border border-brand-border bg-brand-light p-8 text-center">
            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <FolderKanban className="w-6 h-6 text-text-secondary" />
            </div>
            <h3 className="font-medium text-text-primary mb-2">
              No projects yet
            </h3>
            <p className="text-sm text-text-secondary mb-4">
              Create your first project to get started
            </p>
            <Button onClick={() => navigate("/projects")}>
              Create Project
            </Button>
          </div>
        ) : (
          <div className="rounded-xl border border-brand-border bg-brand-light divide-y divide-brand-border overflow-hidden">
            {recentProjects.map((project) => (
              <Link
                key={project.id}
                to={`/projects/${project.id}`}
                className="flex items-center justify-between p-4 hover:bg-brand-dark/5 dark:hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FolderKanban className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-text-primary truncate">
                        {project.name}
                      </h3>
                      <span className="text-xs font-mono text-text-secondary bg-brand-dark/10 dark:bg-white/10 px-1.5 py-0.5 rounded flex-shrink-0">
                        {project.key}
                      </span>
                    </div>
                    <p className="text-sm text-text-secondary">
                      Created {formatDate(project.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <StatusPill status={project.status || "active"} />
                  <ArrowRight className="w-4 h-4 text-text-secondary" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ title, value, icon: Icon, color, loading }) => {
  const colors = {
    indigo: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400",
    emerald: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
    amber: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
    blue: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  };

  return (
    <div className="rounded-xl border border-brand-border bg-brand-light p-5">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colors[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm text-text-secondary">{title}</p>
          {loading ? (
            <div className="h-8 w-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mt-1" />
          ) : (
            <p className="text-2xl font-bold text-text-primary">
              {value}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
