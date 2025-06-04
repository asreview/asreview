import { projectStatuses } from "globals.js";

/**
 * Get the Material-UI color for a project status
 * @param {string} status - The project status
 * @returns {string} - Material-UI color name
 */
export const getStatusColor = (status) => {
  switch (status) {
    case projectStatuses.SETUP:
      return "warning";
    case projectStatuses.REVIEW:
      return "primary";
    case projectStatuses.FINISHED:
      return "success";
    case "error":
      return "error";
    default:
      return "default";
  }
};

/**
 * Get the display label for a project status
 * @param {string} status - The project status
 * @returns {string} - Human-readable status label
 */
export const getStatusLabel = (status) => {
  switch (status) {
    case projectStatuses.SETUP:
      return "Setup";
    case projectStatuses.REVIEW:
      return "In Review";
    case projectStatuses.FINISHED:
      return "Finished";
    case "error":
      return "Error";
    default:
      return "Unknown";
  }
};
