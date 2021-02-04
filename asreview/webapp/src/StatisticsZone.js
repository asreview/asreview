import React, {useEffect, useState}  from 'react'
import { makeStyles } from '@material-ui/core/styles'

import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  Grid,
  IconButton,
  Link,
  Tooltip,
} from '@material-ui/core';
import RefreshIcon from '@material-ui/icons/Refresh';

import {
  ProgressPieChart,
  ProgressAreaChart,
  ProgressLineChart,
} from './SideStats'

import axios from 'axios'

import { api_url } from './globals.js';

const useStyles = makeStyles(theme => ({

  title: {
    margin: "32px 12px 12px 12px",
  },
  continuButton: {
    marginTop: "24px",
  },
  wrapper: {
    margin: theme.spacing(1),
    position: 'relative',
  },
  buttonProgress: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: 0,
    marginLeft: -12,
  },
  paper: {
    paddingTop: "24px",
    paddingLeft: "40px",
    paddingRight: "40px",
  },
  center: {
    marginTop: -24,
    textAlign: "center",
  },
  pieChart: {
    width: "100%",
    maxWidth: "245px",
    margin: "auto",
    display: "block",
  },
  notAvailable: {
    paddingTop: "54px",
    paddingBottom: "74px",
    textAlign: "center",
  },
  errorMessage: {
    paddingTop: '38px',
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

    /**
     * Get summary statistics
     */
    const getProgressInfo = () => {

      const url = api_url + `project/${props.project_id}/progress`;

      return axios.get(url)
        .then((result) => {
          setStatistics(result.data)
        })
        .catch((error) => {
          if (error.response) {
            setError(s => {
              return({
                ...s,
                error: true,
                statistics: error.response.data.message,
            })});
            console.log(error);
          } else {
            setError("Connection lost with the server. Please restart the software.");
          };
        });
    }

    const getProgressHistory = () => {

      const url = api_url + `project/${props.project_id}/progress_history`;

      return axios.get(url)
        .then((result) => {
          setHistory(result.data)
        })
        .catch((error) => {
          if (error.response) {
            setError(s => {
              return({
                ...s,
                error: true,
                history: error.response.data.message,
            })});
            console.log(error);
          } else {
            setError("Connection lost with the server. Please restart the software.");
          };
        });
    }

    const getProgressEfficiency = () => {

      const url = api_url + `project/${props.project_id}/progress_efficiency`;

      return axios.get(url)
        .then((result) => {
          setEfficiency(result.data)
        })
        .catch((error) => {
          if (error.response) {
            setError(s => {
              return({
                ...s,
                error: true,
                efficiency: error.response.data.message,
            })});
            console.log(error);
          } else {
            setError("Connection lost with the server. Please restart the software.");
          };
        });
    }

    if (props.projectInitReady && !props.training){
        getProgressInfo();
        getProgressHistory();
        getProgressEfficiency();
    }
  }, [props.projectInitReady, props.training, props.project_id, error.error]);

  return (
    <Box>
      <Typography
        variant="h6"
        className={classes.title}
      >
        Statistics
      </Typography>

      <Paper className={classes.paper}>
        {(error.statistics !== null || error.history !== null || error.efficiency !== null) &&
          <Box>
            <Box className={classes.errorMessage}>
              <Typography>
                {error.statistics}
              </Typography>
              <Typography>
                {error.history}
              </Typography>
              <Typography>
                {error.efficiency}
              </Typography>
              <Box fontStyle="italic">
                <Typography align="center">
                  If the issue remains after refreshing, click
                  <Link
                    className={classes.link}
                    href="https://github.com/asreview/asreview/issues/new/choose"
                    target="_blank"
                  >
                    <strong>here</strong>
                  </Link> to report.
                </Typography>
              </Box>
            </Box>
            <Box className={classes.retryButton} align="center">
              <Tooltip title="Refresh">
                <IconButton
                  color="primary"
                  onClick={handleClickRetry}
                >
                  <RefreshIcon fontSize="large" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        }
        {(error.statistics === null && error.history === null && error.efficiency === null) && statistics !== null &&
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
                <ProgressAreaChart
                  history={history}
                />
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box>
                <ProgressLineChart
                  efficiency={efficiency}
                />
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Box className={classes.center}>
                <Typography>
                  Total reviewed: {statistics.n_included + statistics.n_excluded} ({Math.round((statistics.n_included + statistics.n_excluded)/statistics.n_papers*10000)/100}%)
                </Typography>
              </Box>
            </Grid>
          </Grid>
        }
        {(error.statistics === null && statistics === null && !(!props.projectInitReady || props.training)) &&
          <Box className={classes.notAvailable}>
            <CircularProgress/>
          </Box>
        }
        {(!props.projectInitReady || props.training) &&
          <Box
            className={classes.notAvailable}
          >
            <Typography>
              Statistics aren't available yet. Please finish the setup first.
            </Typography>
          </Box>
        }

      </Paper>
    </Box>
  )
}

export default StatisticsZone;
