import * as React from "react";
import { Box, Typography } from "@mui/material";

export default function SavingStateBox(props) {
  const bgColor = (theme) =>
    theme.palette.mode === "dark" ? "#282828" : "rgba(0, 0, 0, 0.06)";

  return (
    <Box sx={{ bgcolor: bgColor, pl: 1, pr: 1 }}>
      <Typography variant="subtitle2" sx={{ color: "text.secondary" }}>
        {props.isSaving ? "Saving..." : "Saved"}
      </Typography>
    </Box>
  );
}
