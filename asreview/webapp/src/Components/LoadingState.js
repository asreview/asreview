import React from "react";
import { Box, Stack, Typography, CircularProgress } from "@mui/material";

const LoadingState = ({
  message = "Loading...",
  minHeight = "300px",
  size = 40,
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight,
      }}
    >
      <Stack spacing={2} alignItems="center">
        <CircularProgress size={size} />
        <Typography variant="body2" color="text.secondary">
          {message}
        </Typography>
      </Stack>
    </Box>
  );
};

export default LoadingState;
