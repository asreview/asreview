import * as React from "react";
import { Box, Typography } from "@mui/material";

export default function SelectItem(props) {
  return (
    <Box>
      <Typography className="typography-wrap" variant="subtitle1">
        {props.primary}
      </Typography>
      {props.secondary && (
        <Typography
          className="typography-wrap"
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
