import * as React from "react";

import { Box, Grid, Typography, styled } from "@mui/material";

import { DatasetInfo } from "../InfoComponents";
import { ProjectInfo } from "../../../ProjectComponents";

const PREFIX = "InfoForm";

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

const InfoForm = ({ handleComplete, editable = true }) => {
  return (
    <Root className={classes.root}>
      <Box className={classes.title}>
        <Typography variant="h6">Project Information</Typography>
      </Box>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={8}>
          <ProjectInfo handleComplete={handleComplete} editable={editable} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <DatasetInfo />
        </Grid>
      </Grid>
    </Root>
  );
};

export default InfoForm;
