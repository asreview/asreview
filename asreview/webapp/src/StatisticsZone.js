import React, {useRef, useEffect, useState}  from 'react'
import { makeStyles } from '@material-ui/core/styles'

import {
  Box,
  Button,
  Container,
  Stepper,
  Step,
  StepLabel,
  StepButton,
  Typography,
  CircularProgress,
  Paper,
  List,
  ListItemIcon,
  Divider,
  Grid,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
} from '@material-ui/core';

import ProjectSettings from './ProjectSettings.js'

import {
  ProgressPieChart,
  ProgressAreaChart,
} from './SideStats'

import KeyboardVoiceIcon from '@material-ui/icons/KeyboardVoice';
import InboxIcon from '@material-ui/icons/Inbox';

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

  },
  center: {
    marginTop: -24,
    textAlign: "center",
  },
  pieChart: {
    paddingTop: "12px",
    paddingLeft: "90px",
  },
  areaChart: {
    paddingTop: "12px",
    paddingRight: "64px",
    paddingLeft: "64px",
  },
  notAvailable: {
    paddingTop: "74px",
    paddingBottom: "74px",
    textAlign: "center",
  },
}));

const StatisticsZone = (props) => {

  const classes = useStyles();

  const [statistics, setStatistics] = useState(null);
  const [history, setHistory] = useState([]);

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
        .catch((err) => {
            console.log(err)
        })
    }

    const getProgressHistory = () => {

      const url = api_url + `project/${props.project_id}/progress_history`;

      return axios.get(url)
        .then((result) => {
          setHistory(result.data)
        })
        .catch((err) => {
          console.log(err)
        })
    }

    if (props.projectInitReady && !props.training){
        getProgressInfo();
        getProgressHistory();
    }
  }, [props.projectInitReady, props.training]);

  console.log(props.projectInitReady)
  console.log(props.training)

  return (
    <Box>
      <Typography
        variant="h6"
        className={classes.title}
      >
        Statistics
      </Typography>

      <Paper className={classes.paper}>
        {statistics !== null &&
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Box className={classes.pieChart}>
                <ProgressPieChart
                  n_included={statistics.n_included}
                  n_excluded={statistics.n_excluded}
                />
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box className={classes.areaChart}>
                <ProgressAreaChart
                  history={history}
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
        {(statistics === null && !(!props.projectInitReady || props.training)) &&
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
