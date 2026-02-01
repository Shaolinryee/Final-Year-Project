/**
 * InviteMemberModal Component
 * Modal for inviting new members to a project
 */

import { useState } from "react";
import { Mail, UserPlus, X } from "lucide-react";
import { Modal, Button, Input, Select } from "../ui";

const InviteMemberModal = ({
  isOpen,
  onClose,
  onSubmit,
  loading = false,
  error = null,
}) => {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");
  const [localError, setLocalError] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLocalError(null);

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setLocalError("Email is required");
      return;
    }
    if (!emailRegex.test(email)) {
      setLocalError("Please enter a valid email address");
      return;
    }

    onSubmit({ email: email.trim().toLowerCase(), role });
  };

  const handleClose = () => {
    setEmail("");
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

        {/* Email Input */}
        <div>
          <label
            htmlFor="invite-email"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              id="invite-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="colleague@company.com"
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              disabled={loading}
            />
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            If the user exists, they'll be able to accept the invitation
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
            disabled={loading}
          >
            <option value="member">Member - Can view and manage tasks</option>
            <option value="owner">Owner - Full project control</option>
          </select>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={loading}
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
