import { Box, LinearProgress, Typography } from "@mui/material";

/**
 * Reusable upload progress bar component
 * @param {number} progress - Upload progress percentage (0-100)
 * @param {boolean} show - Whether to show the progress bar
 */
const UploadProgressBar = ({ progress, show }) => {
  if (!show) return null;

  const isComplete = progress >= 100;
  const message = isComplete
    ? "Data has been uploaded"
    : `Uploading: ${progress}%`;

  return (
    <Box
      sx={{
        width: "80%",
        maxWidth: "400px",
        alignSelf: "center",
      }}
    >
      <Typography variant="body2" color="text.secondary" align="center">
        {message}
      </Typography>
      <LinearProgress variant="determinate" value={progress} sx={{ mt: 1 }} />
    </Box>
  );
};

export default UploadProgressBar;
