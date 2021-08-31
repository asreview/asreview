import React from "react";
import { useQuery } from "react-query";
import { Grid, Paper, Typography } from "@material-ui/core";
// import BuildIcon from '@material-ui/icons/Build';
// import LibraryBooksIcon from '@material-ui/icons/LibraryBooks';
// import ArchiveIcon from '@material-ui/icons/Archive';

import { makeStyles } from "@material-ui/core/styles";

import { ProjectAPI } from "../api/index.js";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: "16px",
    display: "flex",
  },
  icon: {
    // color: "rgba(0, 0, 2, 0.54)",
    // fontSize: "64px",
  },
  number: {
    textAlign: "center",
    margin: "auto",
  },
}));

const DashboardStats = (props) => {
  const classes = useStyles();

  const { data, isFetched } = useQuery(
    "fetchDashboardStats",
    ProjectAPI.fetchDashboardStats,
    { refetchOnWindowFocus: false }
  );

  return (
    <div>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={4}>
          <Paper className={classes.root}>
            <div className={classes.number}>
              <Typography variant="h4" style={{ fontWeight: "bold" }}>
                {isFetched ? data.n_setup : 0}
              </Typography>
              <Typography>Setup</Typography>
            </div>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper className={classes.root}>
            <div className={classes.number}>
              <Typography variant="h4" style={{ fontWeight: "bold" }}>
                {isFetched ? data.n_in_review : 0}
              </Typography>
              <Typography>In Review</Typography>
            </div>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper className={classes.root}>
            <div className={classes.number}>
              <Typography variant="h4" style={{ fontWeight: "bold" }}>
                {isFetched ? data.n_finished : 0}
              </Typography>
              <Typography>Finished</Typography>
            </div>
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
};

export default DashboardStats;
