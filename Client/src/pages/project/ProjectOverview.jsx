/**
 * ProjectOverview - Main overview page for a project
 * Redesigned for visual hierarchy, cognitive load reduction, and strong SaaS UX
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Edit2,
  Trash2,
  ListTodo,
  Clock,
  CheckCircle2,
  Users,
  Activity,
  Plus,
  Calendar,
  Settings,
} from "lucide-react";
import { useProject } from "./ProjectLayout";
import { projectsApi } from "../../services/api";
import {
  Button,
  Alert,
  ConfirmDialog,
  StatusPill,
} from "../../components/ui";
import { ProjectFormModal } from "../../components/projects";

// --- Sub-components for clean modularity ---

const MetricCard = ({ icon, title, value, colorClass }) => (
  <div className="p-5 rounded-2xl bg-brand-light border border-brand-border shadow-sm flex items-center gap-4 transition-transform hover:-translate-y-0.5 duration-200">
    <div className={`p-3 rounded-xl flex-shrink-0 ${colorClass}`}>
      {icon}
    </div>
    <div>
      <p className="text-3xl font-bold text-text-primary">{value}</p>
      <p className="text-sm font-medium text-text-secondary mt-0.5">{title}</p>
    </div>
  </div>
);

const MetricsSection = ({ taskCounts, membersCount }) => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
    <MetricCard 
      icon={<ListTodo className="w-6 h-6" />} 
      title="Total Tasks" 
      value={taskCounts.total} 
      colorClass="text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 dark:text-indigo-400" 
    />
    <MetricCard 
      icon={<Clock className="w-6 h-6" />} 
      title="In Progress" 
      value={taskCounts.inProgress} 
      colorClass="text-amber-600 bg-amber-50 dark:bg-amber-500/10 dark:text-amber-400" 
    />
    <MetricCard 
      icon={<CheckCircle2 className="w-6 h-6" />} 
      title="Completed" 
      value={taskCounts.done} 
      colorClass="text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400" 
    />
    <MetricCard 
      icon={<Users className="w-6 h-6" />} 
      title="Team Members" 
      value={membersCount} 
      colorClass="text-purple-600 bg-purple-50 dark:bg-purple-500/10 dark:text-purple-400" 
    />
  </div>
);

const ProgressCard = ({ taskCounts }) => {
  const percent = taskCounts.total > 0 ? Math.round((taskCounts.done / taskCounts.total) * 100) : 0;
  return (
    <div className="p-5 rounded-2xl bg-brand-light border border-brand-border shadow-sm flex flex-col md:flex-row md:items-center gap-6">
      <div className="flex-shrink-0">
        <h3 className="font-semibold text-text-primary text-base">Project Progress</h3>
        <span className="text-sm font-medium text-text-secondary">
          {taskCounts.done} of {taskCounts.total} Tasks Completed
        </span>
      </div>
      <div className="flex-1 flex items-center gap-4">
        <div className="flex-1 h-2.5 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
          <div 
            className="h-full bg-emerald-500 rounded-full transition-all duration-700 ease-in-out" 
            style={{ width: `${percent}%` }}
          />
        </div>
        <span className="text-lg font-bold text-text-primary min-w-[3rem] text-right">{percent}%</span>
      </div>
    </div>
  );
};

const UnifiedBoard = ({ tasks, activities, projectId, navigate }) => {
  const [activeTab, setActiveTab] = useState('tasks');
  const displayTasks = tasks.slice(0, 8);
  const displayActivities = activities.slice(0, 8);

  const buttonText = activeTab === 'tasks' ? 'View All Tasks' : 'View All Activity';
  const buttonAction = () => {
    navigate(`/projects/${projectId}/${activeTab === 'tasks' ? 'tasks' : 'activity'}`);
  };

  return (
    <div className="bg-brand-light rounded-2xl border border-brand-border shadow-sm flex flex-col min-h-[400px]">
      <div className="px-6 border-b border-brand-border flex items-center justify-between bg-gray-50/50 dark:bg-brand-dark/20 rounded-t-2xl">
        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab('tasks')}
            className={`py-4 font-semibold text-sm border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'tasks'
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            Tasks
            <span className="bg-gray-100 dark:bg-white/10 text-xs px-2 py-0.5 rounded-full text-text-primary">{tasks.length}</span>
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`py-4 font-semibold text-sm border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'activity'
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            Activity
            <span className="bg-gray-100 dark:bg-white/10 text-xs px-2 py-0.5 rounded-full text-text-primary">{activities.length}</span>
          </button>
        </div>
        
        <Button variant="outline" size="sm" onClick={buttonAction}>
          {buttonText}
        </Button>
      </div>
      
      <div className="flex-1 overflow-hidden relative">
        {/* Tasks View */}
        {activeTab === 'tasks' && (
          <div className="h-full overflow-y-auto animate-in fade-in duration-300">
            {displayTasks.length === 0 ? (
              <div className="p-10 text-center flex flex-col items-center justify-center h-full">
                <ListTodo className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
                <p className="text-text-secondary">No tasks have been created yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-brand-border">
                {displayTasks.map(task => (
                  <div key={task.id} className="p-5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors flex items-center justify-between group">
                    <div className="flex items-center gap-5">
                      <div className="flex-shrink-0 w-24">
                        <StatusPill status={task.status} />
                      </div>
                      <div>
                        <h3 
                          className="font-semibold text-text-primary cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors" 
                          onClick={() => navigate(`/projects/${projectId}/tasks/${task.id}`, { state: { from: `/projects/${projectId}/overview` } })}
                        >
                          {task.title}
                        </h3>
                        <div className="flex items-center gap-5 mt-1.5 text-xs font-medium text-text-secondary">
                          {task.dueDate && (
                            <span className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5" /> 
                              {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                          )}
                          {task.assignee && (
                            <span className="flex items-center gap-1.5">
                              <Users className="w-3.5 h-3.5" /> 
                              {task.assignee.name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0" 
                        title="View Task Details" 
                        onClick={() => navigate(`/projects/${projectId}/tasks/${task.id}`, { state: { from: `/projects/${projectId}/overview` } })}
                      >
                        <Edit2 className="w-4 h-4 text-text-secondary hover:text-indigo-600 dark:hover:text-indigo-400" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Activity View */}
        {activeTab === 'activity' && (
          <div className="h-full overflow-y-auto p-6 animate-in fade-in duration-300 custom-scrollbar max-h-[500px]">
            {displayActivities.length === 0 ? (
              <div className="text-center flex flex-col items-center justify-center p-10 h-full">
                <Activity className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
                <p className="text-text-secondary">No recent activity.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {displayActivities.map(activity => (
                  <div key={activity.id} className="flex gap-4">
                    <div className="mt-1 flex-shrink-0">
                      <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 ring-4 ring-indigo-50 dark:ring-indigo-500/10" />
                    </div>
                    <div>
                      <p className="text-sm text-text-primary leading-tight">
                        <span className="font-semibold">{activity.user?.name || "Someone"}</span>{' '}
                        {activity.details ? activity.details.charAt(0).toLowerCase() + activity.details.slice(1) : "performed an action"}
                      </p>
                      <span className="text-xs font-medium text-text-secondary mt-1 block">
                        {new Date(activity.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};


// --- Main Component ---

const ProjectOverview = () => {
  const navigate = useNavigate();
  const {
    project,
    tasks,
    members,
    activities,
    isOwner,
    isAdmin,
    setProject,
  } = useProject();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [error, setError] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  // Derived Stats
  const taskCounts = {
    total: tasks.length,
    todo: tasks.filter((t) => t.status?.toUpperCase() === "TODO").length,
    inProgress: tasks.filter((t) => t.status?.toUpperCase() === "IN_PROGRESS").length,
    done: tasks.filter((t) => ["DONE", "COMPLETED"].includes(t.status?.toUpperCase())).length,
  };

  // Handlers
  const handleUpdate = async (formData) => {
    setFormLoading(true);
    setError(null);
    try {
      const { data, error } = await projectsApi.update(project.id, formData);
      if (error) throw new Error(error);
      setProject(data);
      setIsEditOpen(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    setFormLoading(true);
    try {
      const { error } = await projectsApi.delete(project.id);
      if (error) throw new Error(error);
      navigate("/projects");
    } catch (err) {
      setError(err.message);
      setIsDeleteOpen(false);
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2.5">
            <span className="px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider">
              {project.key}
            </span>
            <StatusPill status={project.status || "active"} />
          </div>
          <h1 className="text-3xl font-extrabold text-text-primary tracking-tight">{project.name}</h1>
          {project.description && (
            <p className="text-text-secondary mt-2 max-w-2xl text-base">{project.description}</p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {(isOwner || isAdmin) && (
            <>
              <Button
                variant="outline"
                size="md"
                onClick={() => setIsEditOpen(true)}
                className="bg-brand-light"
                title="Project Settings"
              >
                <Settings className="w-4 h-4 text-text-secondary" />
              </Button>
              <Button
                variant="outline"
                size="md"
                onClick={() => setIsDeleteOpen(true)}
                className="bg-brand-light text-rose-500 hover:text-rose-600 hover:border-rose-200"
                title="Delete Project"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </>
          )}
          
          <Button variant="outline" leftIcon={<ListTodo className="w-4 h-4" />} onClick={() => navigate(`/projects/${project.id}/tasks`)}>
            Tasks
          </Button>
          <Button variant="outline" leftIcon={<Users className="w-4 h-4" />} onClick={() => navigate(`/projects/${project.id}/members`)}>
            Team
          </Button>
          <Button variant="outline" leftIcon={<Activity className="w-4 h-4" />} onClick={() => navigate(`/projects/${project.id}/activity`)}>
            Log
          </Button>
          <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />} onClick={() => navigate(`/projects/${project.id}/tasks`)}>
            Add Task
          </Button>
        </div>
      </div>

      {/* Error handling */}
      {error && <Alert variant="error" message={error} onDismiss={() => setError(null)} />}

      {/* 2. Metrics Grid */}
      <MetricsSection taskCounts={taskCounts} membersCount={members.length} />

      {/* 3. Progress Bar */}
      <ProgressCard taskCounts={taskCounts} />

      {/* 4. Unified Board (Tasks & Activity Tabs) */}
      <div className="grid grid-cols-1 gap-6">
        <UnifiedBoard tasks={tasks} activities={activities} projectId={project.id} navigate={navigate} />
      </div>

      {/* Modals */}
      <ProjectFormModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSubmit={handleUpdate}
        project={project}
        isLoading={formLoading}
      />

      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Project"
        message="Are you sure you want to delete this project? This action cannot be undone and all tasks, members, and activity will be permanently removed."
        confirmLabel="Delete Project"
        variant="danger"
        isLoading={formLoading}
      />
    </div>
  );
};

export default ProjectOverview;
