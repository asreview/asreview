import * as React from "react";
import { Link, Stack, Typography } from "@mui/material";
import { Warning } from "@mui/icons-material";

export default function InlineErrorHandler({
  message,
  button = true,
  refetch = null,
  buttonText = "Try to refresh",
}) {
  if (!message) return null;

  return (
    <Stack
      direction="row"
      spacing={1}
      alignItems="center"
      sx={{
        justifyContent: "center",
        py: 1,
      }}
    >
      <Warning color="error" fontSize="small" />
      <Typography variant="body2">
        {message}{" "}
        {button && refetch && (
          <Link component="button" underline="none" onClick={refetch}>
            {buttonText}
          </Link>
        )}
      </Typography>
    </Stack>
  );
}
