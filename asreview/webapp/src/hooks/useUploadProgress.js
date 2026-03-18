import { useState, useCallback } from "react";

/**
 * Custom hook to track file upload progress
 * @returns {Object} Object containing progress value and callback
 * @returns {number} progress - Current upload progress (0-100)
 * @returns {Function} onUploadProgress - Callback function for axios upload progress
 * @returns {Function} resetProgress - Function to reset progress to 0
 */
export const useUploadProgress = () => {
  const [progress, setProgress] = useState(0);

  const onUploadProgress = useCallback((progressEvent) => {
    const percentCompleted = Math.round(
      (progressEvent.loaded * 100) / progressEvent.total,
    );
    setProgress(percentCompleted);
  }, []);

  const resetProgress = useCallback(() => {
    setProgress(0);
  }, []);

  return { progress, onUploadProgress, resetProgress };
};
