import * as React from "react";
import { Typography } from "@mui/material";

export function StyledTypoH5Medium(props) {
  return (
    <Typography
      variant="h5"
      sx={{ fontWeight: (theme) => theme.typography.fontWeightMedium }}
    >
      {props.text}
    </Typography>
  );
}

export function StyledTypoSubtitle1Medium(props) {
  return (
    <Typography
      variant="subtitle1"
      sx={{ fontWeight: (theme) => theme.typography.fontWeightMedium }}
    >
      {props.text}
    </Typography>
  );
}
