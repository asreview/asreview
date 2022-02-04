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
import { Add, Upload } from "@mui/icons-material";

import { TypographyH5Medium } from "../../StyledComponents/StyledTypography.js";

const PREFIX = "DashboardPageHeader";

const classes = {
  headerButton: `${PREFIX}-header-button`,
};

const Root = styled("div")(({ theme }) => ({
  background: theme.palette.background.paper,
  [`& .${classes.headerButton}`]: {
    backgroundColor: [
      theme.palette.mode === "dark"
        ? theme.palette.grey[900]
        : theme.palette.grey[100],
    ],
    [theme.breakpoints.down("md")]: {
      width: 24,
      height: 24,
    },
  },
}));

export default function DashboardPageHeader(props) {
  return (
    <Root className="main-page-sticky-header-wrapper">
      <Box className="main-page-sticky-header with-button">
        {!props.mobileScreen && <TypographyH5Medium></TypographyH5Medium>}
        {props.mobileScreen && (
          <Typography variant="h6">Home dashboard</Typography>
        )}
        <Stack direction="row" spacing={1}>
          <Tooltip title="New project">
            <IconButton
              disableRipple
              onClick={props.toggleSetupDialog}
              size={!props.mobileScreen ? "medium" : "small"}
            >
              <Avatar className={classes.headerButton}>
                <Add
                  color="primary"
                  fontSize={!props.mobileScreen ? "medium" : "small"}
                />
              </Avatar>
            </IconButton>
          </Tooltip>
          <Tooltip title="Import project">
            <IconButton
              disableRipple
              onClick={props.toggleImportDialog}
              size={!props.mobileScreen ? "medium" : "small"}
            >
              <Avatar className={classes.headerButton}>
                <Upload
                  color="primary"
                  fontSize={!props.mobileScreen ? "medium" : "small"}
                />
              </Avatar>
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>
    </Root>
  );
}
