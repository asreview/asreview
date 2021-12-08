import * as React from "react";
import { Box, Typography } from "@mui/material";

export default function SelectItem(props) {
  return (
    <Box>
      <Typography variant="subtitle1">{props.primary}</Typography>
      {props.secondary && (
        <Typography
          variant="body2"
          gutterBottom
          sx={{ color: "text.secondary" }}
        >
          {props.secondary}
        </Typography>
      )}
    </Box>
  );
}
