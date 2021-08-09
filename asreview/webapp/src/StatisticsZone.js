import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";

import {
  Box,
  CircularProgress,
  Grid,
  IconButton,
  Link,
  MobileStepper,
  Paper,
  Tooltip,
  Typography,
} from "@material-ui/core";
import {
  KeyboardArrowLeft,
  KeyboardArrowRight,
  Refresh,
} from "@material-ui/icons";

import SwipeableViews from "react-swipeable-views";

import { ProgressAreaChart, ProgressLineChart } from "./SideStats";

import { ProjectAPI } from "./api/index.js";

const useStyles = makeStyles((theme) => ({
  title: {
    margin: "32px 12px 12px 12px",
  },
  continuButton: {
    marginTop: "24px",
  },
  wrapper: {
    margin: theme.spacing(1),
    position: "relative",
  },
  buttonProgress: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: 0,
    marginLeft: -12,
  },
  paper: {
    padding: "24px 40px 24px 40px",
  },
  text: {
    margin: "auto",
  },
  textLabel: {
    width: 105,
  },
  chartStepper: {
    background: "inherit",
    padding: 0,
  },
  notAvailable: {
    paddingTop: "54px",
    paddingBottom: "74px",
    textAlign: "center",
  },
  errorMessage: {
    paddingTop: "38px",
    textAlign: "center",
  },
  link: {
    paddingLeft: "3px",
  },
  retryButton: {
    position: "relative",
    top: "8px",
    paddingBottom: "28px",
  },
}));

const StatisticsZone = (props) => {
  const classes = useStyles();

  const [statistics, setStatistics] = useState(null);
  const [activeChart, setActiveChart] = React.useState(0);
  const [history, setHistory] = useState([]);
  const [efficiency, setEfficiency] = useState([]);
  const [error, setError] = useState({
    error: false,
    statistics: null,
    history: null,
    efficiency: null,
  });

  const handleChartChange = (chart) => {
    setActiveChart(chart);
  };

  const handleNextChart = () => {
    setActiveChart((prevActiveChart) => prevActiveChart + 1);
  };

  const handleBackChart = () => {
    setActiveChart((prevActiveChart) => prevActiveChart - 1);
  };

  const handleClickRetry = () => {
    setError({
      error: false,
      statistics: null,
      history: null,
      efficiency: null,
    });
  };

  useEffect(() => {
    // flag denotes mount status
    let isMounted = true;

    const getProgressInfo = () => {
      ProjectAPI.progress(props.project_id)
        .then((result) => {
          if (isMounted) setStatistics(result.data);
        })
        .catch((error) => {
          setError((s) => {
            return {
              ...s,
              error: true,
              statistics: error.message,
            };
          });
        });
    };

    const getProgressHistory = () => {
      ProjectAPI.progress_history(props.project_id)
        .then((result) => {
          if (isMounted) setHistory(result.data);
        })
        .catch((error) => {
          setError((s) => {
            return {
              ...s,
              error: true,
              history: error.message,
            };
          });
        });
    };

    const getProgressEfficiency = () => {
      ProjectAPI.progress_efficiency(props.project_id)
        .then((result) => {
          if (isMounted) setEfficiency(result.data);
        })
        .catch((error) => {
          setError((s) => {
            return {
              ...s,
              error: true,
              efficiency: error.message,
            };
          });
        });
    };

    if (props.projectInitReady && !props.training) {
      getProgressInfo();
      getProgressHistory();
      getProgressEfficiency();
    }

    // useEffect cleanup to set flag false, if unmounted
    return () => {
      isMounted = false;
    };
  }, [props.projectInitReady, props.training, props.project_id, error.error]);

  return (
    <Box>
      <Typography variant="h6" className={classes.title}>
        Statistics
      </Typography>

      <Paper className={classes.paper}>
        {(error.statistics !== null ||
          error.history !== null ||
          error.efficiency !== null) && (
          <Box>
            <Box className={classes.errorMessage}>
              <Typography>{error.statistics}</Typography>
              <Typography>{error.history}</Typography>
              <Typography>{error.efficiency}</Typography>
              <Box fontStyle="italic">
                <Typography variant="body2" align="center">
                  If the issue remains after refreshing, click
                  <Link
                    className={classes.link}
                    href="https://github.com/asreview/asreview/issues/new/choose"
                    target="_blank"
                  >
                    <strong>here</strong>
                  </Link>{" "}
                  to report.
                </Typography>
              </Box>
            </Box>
            <Box className={classes.retryButton} align="center">
              <Tooltip title="Refresh">
                <IconButton color="primary" onClick={handleClickRetry}>
                  <Refresh />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        )}
        {error.statistics === null &&
          error.history === null &&
          error.efficiency === null &&
          statistics !== null && (
            <Grid container spacing={3}>
              <Grid className={classes.text} item xs={12} sm={4}>
                <Grid container>
                  <Grid className={classes.textLabel} item>
                    <Typography>Total records:</Typography>
                  </Grid>
                  <Grid item>
                    <Typography>{statistics.n_papers}</Typography>
                  </Grid>
                </Grid>
                <Grid container>
                  <Grid className={classes.textLabel} item>
                    <Typography>Reviewed:</Typography>
                  </Grid>
                  <Grid item>
                    <Typography>
                      {statistics.n_included + statistics.n_excluded} (
                      {Math.round(
                        ((statistics.n_included + statistics.n_excluded) /
                          statistics.n_papers) *
                          10000
                      ) / 100}
                      %)
                    </Typography>
                  </Grid>
                </Grid>
                <Grid container>
                  <Grid className={classes.textLabel} item>
                    <Typography>Relevant:</Typography>
                  </Grid>
                  <Grid item>
                    <Typography>{statistics.n_included}</Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12} sm={8}>
                <div>
                  <SwipeableViews
                    enableMouseEvents
                    index={activeChart}
                    onChangeIndex={handleChartChange}
                  >
                    <div>
                      <ProgressAreaChart history={history} />
                    </div>
                    <div>
                      <ProgressLineChart efficiency={efficiency} />
                    </div>
                  </SwipeableViews>
                  <MobileStepper
                    className={classes.chartStepper}
                    variant="dots"
                    steps={2}
                    position="static"
                    activeStep={activeChart}
                    nextButton={
                      <IconButton
                        size="small"
                        onClick={handleNextChart}
                        disabled={activeChart === 1}
                      >
                        <KeyboardArrowRight />
                      </IconButton>
                    }
                    backButton={
                      <IconButton
                        size="small"
                        onClick={handleBackChart}
                        disabled={activeChart === 0}
                      >
                        <KeyboardArrowLeft />
                      </IconButton>
                    }
                  />
                </div>
              </Grid>
            </Grid>
          )}
        {error.statistics === null &&
          statistics === null &&
          !(!props.projectInitReady || props.training) && (
            <Box className={classes.notAvailable}>
              <CircularProgress />
            </Box>
          )}
        {(!props.projectInitReady || props.training) && (
          <Box className={classes.notAvailable}>
            <Typography>
              Statistics aren't available yet. Please finish the setup first.
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default StatisticsZone;
