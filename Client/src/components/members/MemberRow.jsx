/**
 * MemberRow Component
 * Displays a project member with role and action controls
 */

import { useState } from "react";
import {
  ChevronDown,
  Crown,
  UserMinus,
  Shield,
  User,
} from "lucide-react";

const roleConfig = {
  owner: {
    label: "Owner",
    icon: Crown,
    color: "text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400",
  },
  member: {
    label: "Member",
    icon: User,
    color: "text-slate-600 bg-slate-100 dark:bg-slate-700 dark:text-slate-300",
  },
};

const MemberRow = ({
  member,
  currentUserId,
  isCurrentUserOwner,
  onRoleChange,
  onRemove,
  loading = false,
}) => {
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const { user, role } = member;
  const config = roleConfig[role] || roleConfig.member;
  const RoleIcon = config.icon;

  const isCurrentUser = user?.id === currentUserId;
  const canManage = isCurrentUserOwner && !isCurrentUser;

  // Get initials for avatar
  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex items-center justify-between p-4 rounded-lg border border-brand-border bg-brand-light">
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
              {getInitials(user?.name)}
            </span>
          )}
        </div>

        {/* User Info */}
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-text-primary">
              {user?.name || "Unknown User"}
            </h4>
            {isCurrentUser && (
              <span className="text-xs text-text-secondary">(you)</span>
            )}
          </div>
          <p className="text-sm text-text-secondary">
            {user?.email || "No email"}
          </p>
        </div>
      </div>

      {/* Role Badge & Actions */}
      <div className="flex items-center gap-2">
        {/* Role Badge */}
        <div className="relative">
          <button
            onClick={() => canManage && setShowRoleMenu(!showRoleMenu)}
            disabled={!canManage || loading}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${config.color} ${
              canManage ? "cursor-pointer hover:opacity-80" : "cursor-default"
            }`}
          >
            <RoleIcon className="w-3.5 h-3.5" />
            {config.label}
            {canManage && <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {/* Role Dropdown */}
          {showRoleMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowRoleMenu(false)}
              />
              <div className="absolute right-0 top-full mt-1 w-40 bg-brand-light rounded-lg shadow-lg border border-brand-border py-1 z-20">
                {Object.entries(roleConfig).map(([key, cfg]) => {
                  const Icon = cfg.icon;
                  return (
                    <button
                      key={key}
                      onClick={() => {
                        setShowRoleMenu(false);
                        if (key !== role) {
                          onRoleChange(member.userId, key);
                        }
                      }}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-brand-dark/10 dark:hover:bg-white/10 ${
                        key === role ? "bg-brand-dark/5 dark:bg-white/5" : ""
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-text-primary">
                        {cfg.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Remove Button */}
        {canManage && (
          <button
            onClick={() => onRemove(member.userId)}
            disabled={loading}
            className="p-2 text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
            title="Remove member"
          >
            <UserMinus className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default MemberRow;
