import React from 'react';
import {
  Box,
  IconButton,
  Link,
  ListSubheader,
  ListItem,
  Tooltip,
  Typography,
} from '@material-ui/core';

import {
  ProgressPieChart,
  ProgressAreaChart,
} from '../SideStats';

import RefreshIcon from '@material-ui/icons/Refresh';
import { makeStyles } from '@material-ui/core/styles';


const useStyles = makeStyles(theme => ({
  item: {
    margin: "10px 0px 10px 0px",
  },
  areaChart: {
    paddingRight: "40px",
    paddingLeft: "40px",
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

const ProgressPanel = (props) => {
    const classes = useStyles();

    const handleClickRetry = () => {
      props.setSideStatsError(false);
    };

    return (
      <div>
        {props.sideStatsError &&
          <Box>
            <Box className={classes.errorMessage}>
              <Typography>
                Failed to load statistics.
              </Typography>
              <Box fontStyle="italic">
                <Typography variant="body2" align="center">
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
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        }
        {!props.sideStatsError &&
          <div>
            <ListSubheader component="div" id="list-subheader-progress">
              Progress
            </ListSubheader>
            {/*<LinearProgress variant="determinate" value="10" color="primary" />*/}
            <Box>
              <ProgressPieChart
                n_included={props.n_included}
                n_excluded={props.n_excluded}
              />
            </Box>
            <ListItem className={classes.item} key="list-progress-total_labeled">
              Total reviewed: {props.n_included + props.n_excluded} ({Math.round((props.n_included + props.n_excluded)/props.n_papers*10000)/100}%)
            </ListItem>

            <Box className={classes.areaChart} >
              <ProgressAreaChart
                history={props.history}
              />
            </Box>

            <ListItem
              className={classes.item}
              key="n_since_last_inclusion"
            >
              Since last relevant: {props.n_since_last_inclusion}
            </ListItem>
          </div>
        }
      </div>
    );
}

export default ProgressPanel;
