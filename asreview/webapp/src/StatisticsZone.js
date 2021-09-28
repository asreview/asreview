import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  Grid,
  IconButton,
  Link,
  Tooltip,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import RefreshIcon from "@mui/icons-material/Refresh";

import {
  ProgressPieChart,
  ProgressAreaChart,
  ProgressLineChart,
} from "./SideStats";

import { ProjectAPI } from "./api/index.js";

const PREFIX = "StatisticsZone";

const classes = {
  title: `${PREFIX}-title`,
  continuButton: `${PREFIX}-continuButton`,
  wrapper: `${PREFIX}-wrapper`,
  buttonProgress: `${PREFIX}-buttonProgress`,
  paper: `${PREFIX}-paper`,
  center: `${PREFIX}-center`,
  pieChart: `${PREFIX}-pieChart`,
  notAvailable: `${PREFIX}-notAvailable`,
  errorMessage: `${PREFIX}-errorMessage`,
  link: `${PREFIX}-link`,
  retryButton: `${PREFIX}-retryButton`,
};

const StyledBox = styled(Box)(({ theme }) => ({
  [`& .${classes.title}`]: {
    margin: "32px 12px 12px 12px",
  },

  [`& .${classes.continuButton}`]: {
    marginTop: "24px",
  },

  [`& .${classes.wrapper}`]: {
    margin: theme.spacing(1),
    position: "relative",
  },

  [`& .${classes.buttonProgress}`]: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: 0,
    marginLeft: -12,
  },

  [`& .${classes.paper}`]: {
    paddingTop: "24px",
    paddingLeft: "40px",
    paddingRight: "40px",
  },

  [`& .${classes.center}`]: {
    marginTop: -24,
    textAlign: "center",
  },

  [`& .${classes.pieChart}`]: {
    width: "100%",
    maxWidth: "245px",
    margin: "auto",
    display: "block",
  },

  [`& .${classes.notAvailable}`]: {
    paddingTop: "54px",
    paddingBottom: "74px",
    textAlign: "center",
  },

  [`& .${classes.errorMessage}`]: {
    paddingTop: "38px",
    textAlign: "center",
  },

  [`& .${classes.link}`]: {
    paddingLeft: "3px",
  },

  [`& .${classes.retryButton}`]: {
    position: "relative",
    top: "8px",
    paddingBottom: "28px",
  },
}));

const StatisticsZone = (props) => {
  const [statistics, setStatistics] = useState(null);
  const [history, setHistory] = useState([]);
  const [efficiency, setEfficiency] = useState([]);
  const [error, setError] = useState({
    error: false,
    statistics: null,
    history: null,
    efficiency: null,
  });

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
    <StyledBox>
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
                <IconButton
                  color="primary"
                  onClick={handleClickRetry}
                  size="large"
                >
                  <RefreshIcon />
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
              <Grid item xs={12} sm={4}>
                <Box className={classes.pieChart}>
                  <ProgressPieChart
                    n_included={statistics.n_included}
                    n_excluded={statistics.n_excluded}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box>
                  <ProgressAreaChart history={history} />
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box>
                  <ProgressLineChart efficiency={efficiency} />
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Box className={classes.center}>
                  <Typography>
                    Total reviewed:{" "}
                    {statistics.n_included + statistics.n_excluded} (
                    {Math.round(
                      ((statistics.n_included + statistics.n_excluded) /
                        statistics.n_papers) *
                        10000
                    ) / 100}
                    %)
                  </Typography>
                </Box>
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
    </StyledBox>
  );
};

export default StatisticsZone;
