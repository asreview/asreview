import React from 'react'
import { makeStyles, useTheme } from '@material-ui/core/styles'
import { 
  Drawer, 
  IconButton,
  Divider,
  Typography,
} from '@material-ui/core'
import { 
  ChevronRight,
} from '@material-ui/icons'
import axios from 'axios';
import { 
  api_url,
  reviewDrawerWidth 
} from './globals.js';
import ProjectPanel from './ProjectPanel';
import ProgressPanel from './ProgressPanel';

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
          <Typography variant='subtitle1'>This project</Typography>
          </div>
      </div>
      <Divider />
      <ProjectPanel drawerOpen={props.state}/>
      <Divider />
      <ProgressPanel barchartData={props.barchartData} />
    </Drawer>
  );
}
 
export default ReviewDrawer;