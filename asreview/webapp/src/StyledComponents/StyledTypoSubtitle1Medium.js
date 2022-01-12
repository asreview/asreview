import * as React from "react";
import { Typography } from "@mui/material";

export default function StyledTypoSubtitle1Medium(props) {
  return (
    <Typography
      variant="subtitle1"
      sx={{ fontWeight: (theme) => theme.typography.fontWeightMedium }}
    >
      {props.text}
    </Typography>
  );
}
