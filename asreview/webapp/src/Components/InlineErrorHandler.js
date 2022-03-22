import * as React from "react";
import { Link, Stack, Typography } from "@mui/material";
import { Warning } from "@mui/icons-material";

export default function InlineErrorHandler(props) {
  return (
    <Stack direction="row" spacing={1} sx={{ justifyContent: "center" }}>
      <Warning color="error" fontSize="small" />
      <Typography variant="body2">
        {props.message}{" "}
        <Link component="button" underline="none" onClick={props.refetch}>
          {props.button ? "Try to refresh" : ""}
        </Link>
      </Typography>
    </Stack>
  );
}
