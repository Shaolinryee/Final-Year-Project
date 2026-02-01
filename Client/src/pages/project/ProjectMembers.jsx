/**
 * ProjectMembers - Team members management page
 */

import { useState } from "react";
import { UserPlus, Users } from "lucide-react";
import { useProject } from "./ProjectLayout";
import { membersApi, invitationsApi } from "../../services/api";
import { useNotifications } from "../../context/NotificationContext";
import { Button, Alert, EmptyState } from "../../components/ui";
import { MemberRow, InviteMemberModal, PendingInvites } from "../../components/members";
import { canInviteMembers, canChangeRoles, canRemoveMember } from "../../utils/permissions";

const ProjectMembers = () => {
  const {
    project,
    members,
    invitations,
    membersLoading,
    invitationsLoading,
    isOwner,
    userRole,
    currentUser,
    projectId,
    setMembers,
    setInvitations,
    fetchMembers,
    fetchInvitations,
  } = useProject();

  const { refresh: refreshNotifications } = useNotifications();
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [error, setError] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  // Permission checks
  const canInvite = canInviteMembers(userRole);
  const canManageRoles = canChangeRoles(userRole);

  // Handlers
  const handleInvite = async ({ email, role }) => {
    setFormLoading(true);
    setError(null);

    try {
      const { data, error } = await invitationsApi.create(projectId, email, role);
      if (error) throw new Error(error);

      setInvitations((prev) => [...prev, data]);
      setIsInviteOpen(false);
      
      // Refresh notifications (notification was created for invited user)
      refreshNotifications();
    } catch (err) {
      setError(err.message);
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
      setError(err.message);
    }
  };

  const handleAcceptInvitation = async (invitationId) => {
    try {
      const { error } = await invitationsApi.accept(invitationId);
      if (error) throw new Error(error);

      fetchMembers();
      fetchInvitations();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeclineInvitation = async (invitationId) => {
    try {
      const { error } = await invitationsApi.decline(invitationId);
      if (error) throw new Error(error);

      setInvitations((prev) => prev.filter((inv) => inv.id !== invitationId));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    setError(null);

    try {
      const { error } = await membersApi.updateRole(projectId, userId, newRole);
      if (error) throw new Error(error);

      setMembers((prev) =>
        prev.map((m) => (m.userId === userId ? { ...m, role: newRole } : m))
      );
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRemoveMember = async (userId) => {
    setError(null);

    try {
      const { error } = await membersApi.remove(projectId, userId);
      if (error) throw new Error(error);

      setMembers((prev) => prev.filter((m) => m.userId !== userId));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Team Members</h1>
          <p className="text-text-secondary mt-1">
            {members.length} member{members.length !== 1 ? "s" : ""} in {project?.name}
          </p>
        </div>
        {canInvite && (
          <Button
            onClick={() => setIsInviteOpen(true)}
            leftIcon={<UserPlus className="w-4 h-4" />}
          >
            Invite Member
          </Button>
        )}
      </div>

      {/* Error */}
      {error && (
        <Alert variant="error" message={error} onDismiss={() => setError(null)} />
      )}

      {/* Pending Invitations */}
      {invitations.length > 0 && (
        <PendingInvites
          invitations={invitations}
          isOwner={isOwner}
          canManage={canInvite}
          onRevoke={handleRevokeInvitation}
          onAccept={handleAcceptInvitation}
          onDecline={handleDeclineInvitation}
          isLoading={invitationsLoading}
        />
      )}

      {/* Members List */}
      {membersLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-brand-light rounded-xl animate-pulse" />
          ))}
        </div>
      ) : members.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No members"
          description="Invite team members to collaborate on this project"
          actionLabel={canInvite ? "Invite Member" : undefined}
          onAction={canInvite ? () => setIsInviteOpen(true) : undefined}
        />
      ) : (
        <div className="space-y-3">
          {members.map((member) => (
            <MemberRow
              key={member.userId}
              member={member}
              currentUserId={currentUser?.id}
              currentUserRole={userRole}
              canChangeRoles={canManageRoles}
              canRemove={canRemoveMember(userRole, member.role)}
              onRoleChange={handleRoleChange}
              onRemove={handleRemoveMember}
            />
          ))}
        </div>
      )}

      {/* Role Info */}
      <div className="rounded-xl bg-brand-light border border-brand-border p-5">
        <h3 className="font-semibold text-text-primary mb-4">Role Permissions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-indigo-600 dark:text-indigo-400 font-medium mb-2">Owner</p>
            <ul className="text-text-secondary space-y-1">
              <li>• Full project control</li>
              <li>• Manage members & roles</li>
              <li>• Delete project</li>
              <li>• All admin privileges</li>
            </ul>
          </div>
          <div>
            <p className="text-amber-600 dark:text-amber-400 font-medium mb-2">Admin</p>
            <ul className="text-text-secondary space-y-1">
              <li>• Create & edit tasks</li>
              <li>• Invite new members</li>
              <li>• Manage task assignments</li>
              <li>• View all activity</li>
            </ul>
          </div>
          <div>
            <p className="text-emerald-600 dark:text-emerald-400 font-medium mb-2">Member</p>
            <ul className="text-text-secondary space-y-1">
              <li>• View project & tasks</li>
              <li>• Update assigned tasks</li>
              <li>• Add comments</li>
              <li>• View team members</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Modal */}
      <InviteMemberModal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        onInvite={handleInvite}
        isLoading={formLoading}
        error={error}
      />
    </div>
  );
};

export default ProjectMembers;
