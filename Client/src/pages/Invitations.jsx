/**
 * Invitations Page
 * Shows pending project invitations for the current user
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Check, X, Clock, FolderKanban, AlertCircle } from "lucide-react";
import { invitationsApi, projectsApi, usersApi } from "../services/api";
import { useNotifications } from "../context/NotificationContext";
import { Button, EmptyState, Alert } from "../components/ui";

const Invitations = () => {
  const navigate = useNavigate();
  const { refresh: refreshNotifications } = useNotifications();
  const [invitations, setInvitations] = useState([]);
  const [projects, setProjects] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchInvitations();
  }, []);

  const fetchInvitations = async () => {
    setLoading(true);
    setError(null);

    // Get current user
    const { data: user } = await usersApi.getCurrent();
    setCurrentUser(user);

    if (!user?.email) {
      setLoading(false);
      return;
    }

    // Get pending invitations for user's email
    const { data: invites, error: invError } = await invitationsApi.getPendingForUser(user.email);
    
    if (invError) {
      setError(invError);
      setLoading(false);
      return;
    }

    setInvitations(invites || []);

    // Fetch project details for each invitation
    const projectDetails = {};
    for (const inv of invites || []) {
      const { data: project } = await projectsApi.getById(inv.projectId);
      if (project) {
        projectDetails[inv.projectId] = project;
      }
    }
    setProjects(projectDetails);

    setLoading(false);
  };

  const handleAccept = async (invitationId) => {
    setProcessingId(invitationId);
    setError(null);

    try {
      const { error } = await invitationsApi.accept(invitationId);
      if (error) throw new Error(error);

      // Remove from list
      setInvitations((prev) => prev.filter((inv) => inv.id !== invitationId));
      
      // Refresh notifications to update count
      refreshNotifications();
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessingId(null);
    }
  };

  const handleDecline = async (invitationId) => {
    setProcessingId(invitationId);
    setError(null);

    try {
      const { error } = await invitationsApi.decline(invitationId);
      if (error) throw new Error(error);

      // Remove from list
      setInvitations((prev) => prev.filter((inv) => inv.id !== invitationId));
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-brand-light rounded animate-pulse" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-brand-light rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Invitations</h1>
        <p className="text-text-secondary mt-1">
          Pending project invitations for {currentUser?.email || "you"}
        </p>
      </div>

      {/* Error */}
      {error && (
        <Alert variant="error" message={error} onDismiss={() => setError(null)} />
      )}

      {/* Invitations List */}
      {invitations.length === 0 ? (
        <EmptyState
          icon={Mail}
          title="No pending invitations"
          description="You don't have any project invitations at the moment"
          actionLabel="Browse Projects"
          onAction={() => navigate("/projects")}
        />
      ) : (
        <div className="space-y-4">
          {invitations.map((invitation) => {
            const project = projects[invitation.projectId];
            const isProcessing = processingId === invitation.id;

            return (
              <div
                key={invitation.id}
                className="p-6 rounded-xl bg-brand-light border border-brand-border"
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
                    <FolderKanban className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-text-primary">
                      {project?.name || "Unknown Project"}
                    </h3>
                    {project?.description && (
                      <p className="text-sm text-text-secondary mt-1 line-clamp-2">
                        {project.description}
                      </p>
                    )}

                    {/* Meta */}
                    <div className="flex items-center gap-4 mt-3 text-sm text-text-secondary">
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        Invited {formatDate(invitation.createdAt)}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-brand-dark/10 dark:bg-white/10 text-text-primary capitalize">
                        {invitation.role}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDecline(invitation.id)}
                      disabled={isProcessing}
                      className="text-gray-400 hover:text-rose-400 hover:bg-rose-500/10"
                    >
                      <X className="w-4 h-4 mr-1.5" />
                      Decline
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleAccept(invitation.id)}
                      disabled={isProcessing}
                      leftIcon={<Check className="w-4 h-4" />}
                    >
                      {isProcessing ? "Processing..." : "Accept"}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Info */}
      {invitations.length > 0 && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800 dark:text-amber-200">
            <p className="font-medium">About project invitations</p>
            <p className="text-amber-700 dark:text-amber-300/80 mt-1">
              When you accept an invitation, you'll be added as a member of the project with the specified role.
              You can then view and collaborate on the project.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Invitations;
