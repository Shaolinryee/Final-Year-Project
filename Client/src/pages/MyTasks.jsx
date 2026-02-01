/**
 * MyTasks Page
 * Shows all tasks assigned to the current user across all projects
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ListTodo,
  Clock,
  CheckCircle2,
  AlertCircle,
  FolderKanban,
  Calendar,
  ArrowRight,
} from "lucide-react";
import { tasksApi, projectsApi, usersApi } from "../services/api";
import { Button, EmptyState, StatusPill } from "../components/ui";

const MyTasks = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);

    // Get current user
    const { data: user } = await usersApi.getCurrent();
    setCurrentUser(user);

    // Get all projects
    const { data: projectsData } = await projectsApi.getAll();
    setProjects(projectsData || []);

    // Get tasks from all projects and filter by assigned user
    const allTasks = [];
    for (const project of projectsData || []) {
      const { data: projectTasks } = await tasksApi.getByProject(project.id);
      if (projectTasks) {
        const assigned = projectTasks
          .filter((t) => t.assignedToUserId === user?.id)
          .map((t) => ({ ...t, projectName: project.name, projectKey: project.key }));
        allTasks.push(...assigned);
      }
    }

    setTasks(allTasks);
    setLoading(false);
  };

  const getProjectById = (id) => projects.find((p) => p.id === id);

  const filteredTasks = tasks.filter((task) => {
    if (filter === "all") return true;
    const status = task.status?.toLowerCase();
    if (filter === "todo") return status === "todo";
    if (filter === "in_progress") return status === "in_progress";
    if (filter === "done") return status === "done" || status === "completed";
    return true;
  });

  const taskCounts = {
    all: tasks.length,
    todo: tasks.filter((t) => t.status?.toLowerCase() === "todo").length,
    in_progress: tasks.filter((t) => t.status?.toLowerCase() === "in_progress").length,
    done: tasks.filter((t) => ["done", "completed"].includes(t.status?.toLowerCase())).length,
  };

  const formatDueDate = (date) => {
    if (!date) return null;
    const d = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDay = new Date(d);
    dueDay.setHours(0, 0, 0, 0);
    const diff = Math.ceil((dueDay - today) / (1000 * 60 * 60 * 24));

    if (diff < 0) return { text: "Overdue", isOverdue: true };
    if (diff === 0) return { text: "Today", isOverdue: false };
    if (diff === 1) return { text: "Tomorrow", isOverdue: false };
    return {
      text: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      isOverdue: false,
    };
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-brand-light rounded animate-pulse" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
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
        <h1 className="text-2xl font-bold text-text-primary">My Tasks</h1>
        <p className="text-text-secondary mt-1">
          Tasks assigned to you across all projects
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { key: "all", label: "Total", icon: ListTodo, color: "indigo" },
          { key: "todo", label: "To Do", icon: AlertCircle, color: "slate" },
          { key: "in_progress", label: "In Progress", icon: Clock, color: "amber" },
          { key: "done", label: "Completed", icon: CheckCircle2, color: "emerald" },
        ].map(({ key, label, icon: Icon, color }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`p-4 rounded-xl border transition-all ${
              filter === key
                ? `bg-${color}-500/10 border-${color}-500/30`
                : "bg-brand-light border-brand-border hover:bg-brand-dark/10 dark:hover:bg-white/10"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-${color}-500/20`}>
                <Icon className={`w-5 h-5 text-${color}-600 dark:text-${color}-400`} />
              </div>
              <div className="text-left">
                <p className="text-2xl font-bold text-text-primary">{taskCounts[key]}</p>
                <p className="text-sm text-text-secondary">{label}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Tasks List */}
      {filteredTasks.length === 0 ? (
        <EmptyState
          icon={ListTodo}
          title={filter === "all" ? "No tasks assigned" : `No ${filter.replace("_", " ")} tasks`}
          description={
            filter === "all"
              ? "You don't have any tasks assigned to you yet"
              : "Try selecting a different filter"
          }
          actionLabel={filter === "all" ? "Browse Projects" : undefined}
          onAction={filter === "all" ? () => navigate("/projects") : undefined}
        />
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => {
            const dueInfo = formatDueDate(task.dueDate);
            return (
              <div
                key={task.id}
                className="p-4 rounded-xl bg-brand-light border border-brand-border hover:bg-brand-dark/5 dark:hover:bg-white/[0.07] transition-colors cursor-pointer"
                onClick={() => navigate(`/projects/${task.projectId}/tasks`)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-text-primary truncate">{task.title}</h3>
                    {task.description && (
                      <p className="text-sm text-text-secondary mt-1 line-clamp-1">
                        {task.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-3 flex-wrap">
                      <StatusPill status={task.status?.toLowerCase()} />
                      {task.priority && <StatusPill status={task.priority} />}
                      
                      <span className="inline-flex items-center gap-1.5 text-xs text-text-secondary">
                        <FolderKanban className="w-3.5 h-3.5" />
                        {task.projectKey || task.projectName}
                      </span>

                      {dueInfo && (
                        <span
                          className={`inline-flex items-center gap-1 text-xs ${
                            dueInfo.isOverdue ? "text-rose-600 dark:text-rose-400" : "text-text-secondary"
                          }`}
                        >
                          <Calendar className="w-3.5 h-3.5" />
                          {dueInfo.text}
                        </span>
                      )}
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-text-secondary flex-shrink-0" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyTasks;
