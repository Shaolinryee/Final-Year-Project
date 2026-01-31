/**
 * Validates an email address.
 * @param {string} email 
 * @returns {string|null} Error message or null if valid.
 */
export const validateEmail = (email) => {
  if (!email) return "Email is required";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return "Enter a valid email address";
  return null;
};

/**
 * Validates a password.
 * @param {string} password 
 * @returns {string|null} Error message or null if valid.
 */
export const validatePassword = (password) => {
  if (!password) return "Password is required";
  if (password.length < 8) return "Password must be at least 8 characters";
  return null;
};
