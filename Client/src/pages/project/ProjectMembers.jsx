/**
 * ProjectMembers - Team members management page
 */

import { useState } from "react";
import { UserPlus, Users } from "lucide-react";
import { useProject } from "./ProjectLayout";
import { membersApi, invitationsApi } from "../../services/api";
import { useNotifications } from "../../context/NotificationContext";
import { Button, EmptyState } from "../../components/ui";
import { MemberRow, InviteMemberModal, PendingInvites } from "../../components/members";
import { canInviteMembers, canChangeRoles, canRemoveMember } from "../../utils/permissions";
import { toast } from "react-toastify";

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
  const [formLoading, setFormLoading] = useState(false);

  // Permission checks
  const canInvite = canInviteMembers(userRole);
  const canManageRoles = canChangeRoles(userRole);

  // Handlers
  const handleInvite = async ({ user, role }) => {
    setFormLoading(true);

    try {
      const { data, error } = await invitationsApi.create(projectId, user.id, role);
      if (error) throw new Error(error);

      setInvitations((prev) => [...prev, data]);
      setIsInviteOpen(false);
      
      // Refresh notifications (notification was created for invited user)
      refreshNotifications();
      toast.success(`Invitation sent to ${user.name}`);
    } catch (err) {
      toast.error(err.message || "Failed to send invitation");
    } finally {
      setFormLoading(false);
    }
  };

  const handleRevokeInvitation = async (invitationId) => {
    console.log('handleRevokeInvitation called with invitationId:', invitationId);
    
    if (!invitationId) {
      toast.error('Invalid invitation ID');
      return;
    }
    
    try {
      const { error } = await invitationsApi.revoke(projectId, invitationId);
      if (error) throw new Error(error);

      setInvitations((prev) => prev.filter((inv) => inv.id !== invitationId));
      toast.success("Invitation revoked successfully");
    } catch (err) {
      console.error('Error in handleRevokeInvitation:', err);
      toast.error(err.message || "Failed to revoke invitation");
    }
  };

  const handleAcceptInvitation = async (invitationId) => {
    if (!invitationId) {
      toast.error('Invalid invitation ID');
      return;
    }
    
    try {
      const { error } = await invitationsApi.accept(invitationId);
      if (error) throw new Error(error);

      fetchMembers();
      fetchInvitations();
      toast.success("Invitation accepted successfully");
    } catch (err) {
      toast.error(err.message || "Failed to accept invitation");
    }
  };

  const handleDeclineInvitation = async (invitationId) => {
    if (!invitationId) {
      toast.error('Invalid invitation ID');
      return;
    }
    
    try {
      const { error } = await invitationsApi.decline(invitationId);
      if (error) throw new Error(error);

      setInvitations((prev) => prev.filter((inv) => inv.id !== invitationId));
      toast.success("Invitation declined successfully");
    } catch (err) {
      toast.error(err.message || "Failed to decline invitation");
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const { error } = await membersApi.updateRole(projectId, userId, newRole);
      if (error) throw new Error(error);

      setMembers((prev) =>
        prev.map((m) => (m.userId === userId ? { ...m, role: newRole } : m))
      );
      toast.success("Role updated successfully");
    } catch (err) {
      toast.error(err.message || "Failed to update role");
    }
  };

  const handleRemoveMember = async (userId) => {
    try {
      const { error } = await membersApi.remove(projectId, userId);
      if (error) throw new Error(error);

      setMembers((prev) => prev.filter((m) => m.userId !== userId));
      toast.success("Member removed successfully");
    } catch (err) {
      toast.error(err.message || "Failed to remove member");
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


      {/* Pending Invitations */}
      {invitations.length > 0 && (
        <PendingInvites
          invitations={invitations}
          isOwner={isOwner}
          canManage={canInvite}
          onRevoke={handleRevokeInvitation}
          onAccept={handleAcceptInvitation}
          onDecline={handleDeclineInvitation}
          currentUser={currentUser}
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
        excludeIds={members.map(m => m.userId)}
        excludeInvitedEmails={invitations.map(inv => inv.email)}
      />
    </div>
  );
};

export default ProjectMembers;
