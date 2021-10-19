import React from "react";
import NumberFormat from "react-number-format";
import { useQuery } from "react-query";
import { Grid, Paper, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  Archive,
  Assignment,
  Favorite,
  LibraryBooks,
} from "@mui/icons-material";

import { CardErrorHandler } from "../Components";

import { ProjectAPI } from "../api/index.js";

const PREFIX = "DashboardStats";

const classes = {
  root: `${PREFIX}-root`,
  content: `${PREFIX}-content`,
  icon: `${PREFIX}-icon`,
  number: `${PREFIX}-number`,
  text: `${PREFIX}-text`,
};

const Root = styled("div")(({ theme }) => ({
  position: "relative",
  [`& .${classes.root}`]: {
    borderRadius: 16,
    padding: "24px 0px",
    display: "flex",
  },

  [`& .${classes.content}`]: {
    textAlign: "center",
    margin: "auto",
  },

  [`& .${classes.icon}`]: {
    width: 56,
    height: 56,
    margin: "auto",
    marginBottom: 16,
    display: "flex",
    borderRadius: "50%",
    alignItems: "center",
    justifyContent: "center",
    WebkitBoxAlign: "center",
    WebkitBoxPack: "center",
  },

  [`& .${classes.number}`]: {
    fontWeight: 700,
  },

  [`& .${classes.text}`]: {
    fontWeight: 600,
    opacity: 0.72,
  },
}));

export default function DashboardStats(props) {
  const { data, error, isError, isFetched, isSuccess } = useQuery(
    "fetchDashboardStats",
    ProjectAPI.fetchDashboardStats,
    { refetchOnWindowFocus: false }
  );

  return (
    <Root>
      <CardErrorHandler
        queryKey={"fetchDashboardStats"}
        error={error}
        isError={isError}
      />
      <Grid container spacing={2}>
        <Grid item xs={6} sm={3}>
          <Paper
            className={`${classes.root} paperProjectsInReview`}
            elevation={0}
          >
            <div className={classes.content}>
              <div className={`${classes.icon} iconProjectsInReview`}>
                <Assignment />
              </div>
              <div className="textProjectsInReview">
                <Typography className={classes.number} variant="h4">
                  <NumberFormat
                    value={
                      !isError && isFetched && isSuccess && data.n_in_review
                        ? data.n_in_review
                        : 0
                    }
                    displayType="text"
                    thousandSeparator
                  />
                </Typography>
                <Typography className={classes.text} variant="body2">
                  Projects in Review
                </Typography>
              </div>
            </div>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper
            className={`${classes.root} paperProjectsFinished`}
            elevation={0}
          >
            <div className={classes.content}>
              <div className={`${classes.icon} iconProjectsFinished`}>
                <Archive />
              </div>
              <div className="textProjectsFinished">
                <Typography className={classes.number} variant="h4">
                  <NumberFormat
                    value={
                      !isError && isFetched && isSuccess && data.n_finished
                        ? data.n_finished
                        : 0
                    }
                    displayType="text"
                    thousandSeparator
                  />
                </Typography>
                <Typography className={classes.text} variant="body2">
                  Projects Finished
                </Typography>
              </div>
            </div>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper
            className={`${classes.root} paperRecordsReviewed`}
            elevation={0}
          >
            <div className={classes.content}>
              <div className={`${classes.icon} iconRecordsReviewed`}>
                <LibraryBooks />
              </div>
              <div className="textRecordsReviewed">
                <Typography className={classes.number} variant="h4">
                  <NumberFormat
                    value={
                      !isError && isFetched && isSuccess && data.n_reviewed
                        ? data.n_reviewed
                        : 0
                    }
                    displayType="text"
                    thousandSeparator
                  />
                </Typography>
                <Typography className={classes.text} variant="body2">
                  Labeled Records
                </Typography>
              </div>
            </div>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper
            className={`${classes.root} paperRelevantRecords`}
            elevation={0}
          >
            <div className={classes.content}>
              <div className={`${classes.icon} iconRelevantRecords`}>
                <Favorite />
              </div>
              <div className="textRelevantRecords">
                <Typography className={classes.number} variant="h4">
                  <NumberFormat
                    value={
                      !isError && isFetched && isSuccess && data.n_included
                        ? data.n_included
                        : 0
                    }
                    displayType="text"
                    thousandSeparator
                  />
                </Typography>
                <Typography className={classes.text} variant="body2">
                  Relevant Records
                </Typography>
              </div>
            </div>
          </Paper>
        </Grid>
      </Grid>
    </Root>
  );
}
