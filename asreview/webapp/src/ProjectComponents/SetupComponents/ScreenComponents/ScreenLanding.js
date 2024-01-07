import * as React from "react";
import { connect } from "react-redux";

import { Box, Typography, styled } from "@mui/material";

import { TagEditor } from "../../TagComponents";

import { mapStateToProps } from "../../../globals.js";

const PREFIX = "ScreenLanding";

const classes = {
  root: `${PREFIX}-root`,
  title: `${PREFIX}-title`,
  error: `${PREFIX}-error`,
};

const Root = styled("div")(({ theme }) => ({
  [`& .${classes.root}`]: {
    display: "flex",
  },
  [`& .${classes.title}`]: {
    paddingBottom: 24,
  },
  [`& .${classes.error}`]: {
    marginBottom: 16,
  },
}));

const ScreenLanding = ({ handleComplete, project_id }) => {
  return (
    <Root className={classes.root}>
      <Box className={classes.title}>
        <Typography variant="h6">Screen options</Typography>
      </Box>
      <Box>
        <TagEditor
          project_id={project_id}
          // mobileScreen={props.mobileScreen}
          // onFocus={onFocus}
          // onBlur={onBlur}
        />
      </Box>
    </Root>
  );
};

export default connect(mapStateToProps)(ScreenLanding);
