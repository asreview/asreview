import * as React from "react";
import { Box, Typography } from "@mui/material";

import { TypographyH5Medium } from "../StyledComponents/StyledTypography.js";
import "../App.css";

export default function PageHeader(props) {
  return (
    <Box
      className="main-page-sticky-header-wrapper"
      sx={{ background: (theme) => theme.palette.background.paper }}
    >
      <Box className="main-page-sticky-header">
        {!props.mobileScreen && (
          <TypographyH5Medium>{props.header}</TypographyH5Medium>
        )}
        {props.mobileScreen && (
          <Typography variant="h6">{props.header}</Typography>
        )}
      </Box>
    </Box>
  );
}
