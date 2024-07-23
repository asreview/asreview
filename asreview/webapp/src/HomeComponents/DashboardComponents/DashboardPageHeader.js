import * as React from "react";
import {
  Avatar,
  Box,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { Upload } from "@mui/icons-material";

import { TypographyH5Medium } from "StyledComponents/StyledTypography";

const PREFIX = "DashboardPageHeader";

const classes = {
  headerButton: `${PREFIX}-header-button`,
};

const Root = styled("div")(({ theme }) => ({
  height: "20%",
  [`& .${classes.headerButton}`]: {
    backgroundColor: [
      theme.palette.mode === "dark"
        ? theme.palette.grey[900]
        : theme.palette.grey[100],
    ],
    // [theme.breakpoints.down("md")]: {
    //   width: 24,
    //   height: 24,
    // },
  },
}));

const modeLabelMap = {
  simulate: "Simulation",
  oracle: "Review",
  explore: "Validation",
};

export default function DashboardPageHeader({
  mobileScreen,
  toggleImportProject,
  mode,
}) {
  const modeLabel = modeLabelMap[mode];

  return (
    <Root className="main-page-sticky-header-wrapper">
      <Box className="main-page-sticky-header with-button">
        {mobileScreen && (
          <TypographyH5Medium>{modeLabel} projects</TypographyH5Medium>
        )}
        {/* {(!mobileScreen && mode === "simulate") && (
          <>
          <Typography variant="h3">Simulate the performance</Typography>
          <Typography variant="h6">1. Get a fully labeled dataset</Typography>
          <Typography variant="h6">2. Start a simulation and hold tight</Typography>
          </>
        )}
        {(!mobileScreen && mode !== "simulate") && (
          <>
          <Typography variant="h4">{mode} projects</Typography>
          </>
        )} */}
        {!mobileScreen && (
          <>
            <Typography variant="h4">{modeLabel} projects</Typography>
          </>
        )}
        <Stack direction="row" spacing={1}>
          <Tooltip title="Import project">
            <IconButton
              disableRipple
              onClick={toggleImportProject}
              size={!mobileScreen ? "medium" : "small"}
            >
              <Avatar className={classes.headerButton}>
                <Upload
                  color="primary"
                  fontSize={!mobileScreen ? "medium" : "small"}
                />
              </Avatar>
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>
    </Root>
  );
}
