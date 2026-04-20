/**
 * InviteMemberModal Component
 * Modal for inviting new members to a project
 */

import { useState } from "react";
import { UserPlus, X } from "lucide-react";
import { Modal, Button, Select } from "../ui";
import UserSearchDropdown from "../ui/UserSearchDropdown";

const InviteMemberModal = ({
  isOpen,
  onClose,
  onInvite,
  onSubmit,
  isLoading,
  loading = false,
  error = null,
  excludeIds = [],
  excludeInvitedEmails = [],
}) => {
  const submitHandler = onInvite || onSubmit;
  const submitting = isLoading ?? loading;
  const [selectedUser, setSelectedUser] = useState(null);
  const [role, setRole] = useState("member");
  const [localError, setLocalError] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLocalError(null);

    if (!selectedUser) {
      setLocalError("Please select a user to invite");
      return;
    }

    if (!submitHandler) {
      setLocalError("Invite action is not configured");
      return;
    }

    submitHandler({ user: selectedUser, role });
  };

  const handleClose = () => {
    setSelectedUser(null);
    setRole("member");
    setLocalError(null);
    onClose();
  };

  const displayError = localError || error;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Invite Member">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Error Message */}
        {displayError && (
          <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800">
            <p className="text-sm text-rose-600 dark:text-rose-400">
              {displayError}
            </p>
          </div>
        )}

        {/* User Search Dropdown */}
        <div>
          <label
            htmlFor="invite-user"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Search User
          </label>
          <UserSearchDropdown
            id="invite-user"
            value={selectedUser}
            onChange={setSelectedUser}
            excludeIds={excludeIds}
            excludeInvitedEmails={excludeInvitedEmails}
            placeholder="Search users by name or email..."
            disabled={submitting}
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Search for existing users to invite them to this project
          </p>
        </div>

        {/* Role Selection */}
        <div>
          <label
            htmlFor="invite-role"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Role
          </label>
          <select
            id="invite-role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            disabled={submitting}
          >
            <option value="member">Member - Can view and manage tasks</option>
            <option value="admin">Admin - Can manage members and settings</option>
          </select>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Only the project creator has the Owner role.
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={submitting}
            leftIcon={<UserPlus className="w-4 h-4" />}
          >
            Send Invitation
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default InviteMemberModal;
