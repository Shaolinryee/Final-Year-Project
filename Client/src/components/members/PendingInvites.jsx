/**
 * PendingInvites Component
 * Displays list of pending project invitations
 */

import { useState } from "react";
import { Mail, Clock, X, Check, XCircle } from "lucide-react";
import { Button } from "../ui";

const PendingInvites = ({
  invitations = [],
  isOwner = false,
  canManage = false, // Owner or Admin can manage invitations
  onRevoke,
  onAccept,
  onDecline,
  currentUserEmail,
  loading = false,
}) => {
  const [processingId, setProcessingId] = useState(null);

  // Use canManage if provided, fall back to isOwner for backward compatibility
  const canManageInvitations = canManage || isOwner;

  if (invitations.length === 0) {
    return null;
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleAction = async (action, invitationId) => {
    setProcessingId(invitationId);
    try {
      await action(invitationId);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-text-primary flex items-center gap-2">
        <Clock className="w-4 h-4" />
        Pending Invitations ({invitations.length})
      </h3>

      <div className="space-y-2">
        {invitations.map((invitation) => {
          const isForCurrentUser =
            currentUserEmail &&
            invitation.email.toLowerCase() === currentUserEmail.toLowerCase();
          const isProcessing = processingId === invitation.id;

          return (
            <div
              key={invitation.id}
              className="flex items-center justify-between p-3 rounded-lg border border-dashed border-brand-border bg-brand-dark/5 dark:bg-gray-800/50"
            >
              <div className="flex items-center gap-3">
                {/* Email Icon */}
                <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <Mail className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                </div>

                {/* Invitation Info */}
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-text-primary">
                      {invitation.email}
                    </p>
                    {isForCurrentUser && (
                      <span className="text-xs px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                        You
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-text-secondary">
                    Invited {formatDate(invitation.createdAt)} • Role:{" "}
                    <span className="capitalize">{invitation.role}</span>
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                {isForCurrentUser ? (
                  // Current user can accept/decline their own invitation
                  <>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleAction(onDecline, invitation.id)}
                      disabled={loading || isProcessing}
                      className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-900/20"
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Decline
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleAction(onAccept, invitation.id)}
                      disabled={loading || isProcessing}
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Accept
                    </Button>
                  </>
                ) : canManageInvitations ? (
                  // Owner/Admin can revoke invitations
                  <button
                    onClick={() => handleAction(onRevoke, invitation.id)}
                    disabled={loading || isProcessing}
                    className="p-1.5 text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors disabled:opacity-50"
                    title="Revoke invitation"
                  >
                    <X className="w-4 h-4" />
                  </button>
                ) : (
                  // Non-owners see pending status
                  <span className="text-xs px-2 py-1 rounded-full bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400">
                    Pending
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PendingInvites;
