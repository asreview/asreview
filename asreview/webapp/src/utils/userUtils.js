/**
 * Generate initials from a user's name
 * @param {string} name - The user's full name
 * @returns {string} - User initials (max 2 characters)
 */
export const getInitials = (name) => {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
};

/**
 * Get display name for a user, with fallback to identifier
 * @param {Object} user - User object
 * @returns {string} - Display name
 */
export const getUserDisplayName = (user) => {
  return user?.name || user?.identifier || user?.email || "Unknown User";
};
