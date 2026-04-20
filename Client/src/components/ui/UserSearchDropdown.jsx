/**
 * UserSearchDropdown Component
 * Searchable dropdown for selecting existing users
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, Users, User, Loader2 } from "lucide-react";
import { usersApi } from "../../services/api";

const UserSearchDropdown = ({
  value,
  onChange,
  excludeIds = [],
  excludeInvitedEmails = [],
  placeholder = "Search users by name or email...",
  disabled = false,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  // Debounced search function
  const debouncedSearch = useCallback((query) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(async () => {
      if (query.trim().length < 2) {
        setSearchResults([]);
        return;
      }

      setLoading(true);
      try {
        const { data, error } = await usersApi.search(query.trim());
        if (error) throw new Error(error);

        // Filter out excluded users and invited users
        const filteredResults = (data || []).filter(user => 
          !excludeIds.includes(user.id) &&
          !excludeInvitedEmails.includes(user.email)
        );

        setSearchResults(filteredResults);
      } catch (err) {
        console.error("Search error:", err);
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    }, 300); // 300ms debounce
  }, [excludeIds, excludeInvitedEmails]);

  // Handle search query change
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    // Clear selected user if manually typing
    if (selectedUser) {
      setSelectedUser(null);
      onChange(null);
    }
    
    debouncedSearch(query);
  };

  // Handle user selection
  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setSearchQuery(`${user.name} (${user.email})`);
    setIsOpen(false);
    onChange(user);
  };

  // Handle clear selection
  const handleClear = () => {
    setSelectedUser(null);
    setSearchQuery("");
    onChange(null);
    inputRef.current?.focus();
  };

  // Handle input focus
  const handleInputFocus = () => {
    if (!disabled) {
      setIsOpen(true);
      if (searchResults.length === 0 && searchQuery.trim().length >= 2) {
        debouncedSearch(searchQuery);
      }
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Initialize with selected user
  useEffect(() => {
    if (value && value !== selectedUser) {
      setSelectedUser(value);
      setSearchQuery(value ? `${value.name} (${value.email})` : "");
    }
  }, [value, selectedUser]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

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
    <div ref={dropdownRef} className={`relative ${className}`}>
      {/* Input */}
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2">
          {loading ? (
            <Loader2 className="w-4 h-4 text-text-secondary animate-spin" />
          ) : (
            <Search className="w-4 h-4 text-text-secondary" />
          )}
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full pl-10 pr-10 py-2.5 rounded-lg border border-brand-border bg-brand-light text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-transparent transition-all ${
            disabled ? "opacity-50 cursor-not-allowed" : ""
          }`}
        />
        
        {selectedUser && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors"
            disabled={disabled}
          >
            <User className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && !disabled && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-brand-light rounded-lg shadow-lg border border-brand-border z-50 max-h-64 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 text-brand animate-spin" />
              <span className="ml-2 text-sm text-text-secondary">Searching...</span>
            </div>
          ) : searchQuery.trim().length < 2 ? (
            <div className="p-4 text-center">
              <Search className="w-8 h-8 text-text-secondary mx-auto mb-2 opacity-50" />
              <p className="text-sm text-text-secondary">
                Type at least 2 characters to search users
              </p>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="p-4 text-center">
              <Users className="w-8 h-8 text-text-secondary mx-auto mb-2 opacity-50" />
              <p className="text-sm text-text-secondary">No users found</p>
              <p className="text-xs text-text-secondary mt-1">
                Try different keywords or check if the user exists
              </p>
            </div>
          ) : (
            <div className="py-1">
              {searchResults.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => handleUserSelect(user)}
                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-brand-dark/10 dark:hover:bg-white/10 transition-colors text-left"
                >
                  {/* Avatar */}
                  <div className="w-8 h-8 rounded-full bg-brand/30 flex items-center justify-center text-sm font-bold text-brand flex-shrink-0">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      getInitials(user.name)
                    )}
                  </div>
                  
                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">
                      {user.name}
                    </p>
                    <p className="text-xs text-text-secondary truncate">
                      {user.email}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserSearchDropdown;
