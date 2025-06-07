import React from "react";
import { Box } from "@mui/material";
import { InlineErrorHandler } from "Components";

const ErrorState = ({
  message = "Something went wrong",
  error,
  onRetry,
  showButton = true,
}) => {
  return (
    <Box sx={{ mb: 3 }}>
      <InlineErrorHandler
        message={error?.message || message}
        button={showButton}
        refetch={onRetry}
      />
    </Box>
  );
};

export default ErrorState;
