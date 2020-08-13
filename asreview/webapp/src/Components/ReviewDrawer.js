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
  reviewDrawerWidth,
} from '../globals.js';

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
        n_papers={props.statistics.n_papers}
        n_since_last_inclusion={props.statistics.n_since_last_inclusion}
        history={props.history}
      />
      <Divider />

    </Drawer>
  );
}

export default connect(mapStateToProps)(ReviewDrawer);
