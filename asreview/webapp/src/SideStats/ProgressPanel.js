import React from 'react';
import {
  Box,
  ListSubheader,
  ListItem,
} from '@material-ui/core';

import {
  ProgressPieChart,
  ProgressAreaChart,
} from '../SideStats';

import { makeStyles } from '@material-ui/core/styles';


const useStyles = makeStyles(theme => ({
  item: {
    margin: "10px 0px 10px 0px",
  },
  areaChart: {
    paddingRight: "40px",
    paddingLeft: "40px",
  },
}));

const ProgressPanel = (props) => {
    const classes = useStyles();

    return (
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
      </div>
    );
}

export default ProgressPanel;
