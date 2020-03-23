import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { 
  Drawer, 
  IconButton,
  Divider,
  Typography,
} from '@material-ui/core'
import { 
  ChevronRight,
} from '@material-ui/icons'

import {
  ProgressPanel,
  ProjectPanel,
} from '../SideStats'

import {
  api_url,
  reviewDrawerWidth,
} from '../globals.js';

import axios from 'axios'

import { connect } from "react-redux";

const useStyles = makeStyles(theme => ({
  drawer: {
    width: reviewDrawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: reviewDrawerWidth,
  },
  drawerHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 1),
    ...theme.mixins.toolbar,
    justifyContent: 'flex-start',
  },
  drawerTitle: {
    width: '100%',
  },
}));

const mapStateToProps = state => {
  return { project_id: state.project_id };
};

const ReviewDrawer = (props) => {
  const classes = useStyles();
  // "n_included": null,
  // "n_excluded": null,
  // "n_since_last_inclusion": null,
  // "n_papers": null,
  // "n_pool": null,

  // /**
  //  * Get summary statistics (connect with reduc actions?)
  //  */
  // const getProgressInfo = () => {

  //   const url = api_url + `project/${props.project_id}/progress`;

  //   return axios.get(url)
  //     .then((result) => {
  //         console.log(result);
  //     })
  //     .catch((err) => {
  //         console.log(err)
  //     })
  // }

  return (
    <Drawer
      className={classes.drawer}
      anchor='right'
      open={props.state}
      variant='persistent'
      classes={{paper: classes.drawerPaper}}
    >
      <div className={classes.drawerHeader}>
          <IconButton onClick={(e) => props.handle(false)}>
            <ChevronRight />
          </IconButton>
          <div className={classes.drawerTitle}>
            <Typography variant='subtitle1'>Statistics</Typography>
          </div>
      </div>
      <Divider />
      <ProjectPanel
        name={props.statistics.name}
        authors={props.statistics.authors}
        description={props.statistics.description}
        n_papers={props.statistics.n_papers}
      />
      <Divider />
      <ProgressPanel
        n_included={props.statistics.n_included}
        n_excluded={props.statistics.n_excluded}
      />
    </Drawer>
  );
}
 
export default connect(mapStateToProps)(ReviewDrawer);