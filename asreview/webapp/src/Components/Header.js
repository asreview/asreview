import React, { } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
} from '@material-ui/core'
import MenuDrawer from './MenuDrawer'
import { reviewDrawerWidth } from '../globals.js'

import {
  Menu,
  BarChart,
} from '@material-ui/icons'
import HistoryIcon from '@material-ui/icons/History';
import SettingsIcon from '@material-ui/icons/Settings';

// local imports
import ElasIcon from '../ElasIcon'


import { connect } from "react-redux";

// redux config
import store from '../redux/store'
import { setAppState } from '../redux/actions'


const useStyles = makeStyles({
  menuButton: {
    marginRight: 10
  },
  appBar: {
    flexGrow: 1,
  },
  barFullWidth: {
    paddingRight: 0,
  },
  barWithReviewDrawer: {
    paddingRight: reviewDrawerWidth-10,
  },
  appTitle: {
    flexGrow: 1
  },
  barChart: { },
  menuTitle: {
    marginLeft: 15, marginTop: 15
  },
});

const mapStateToProps = state => {
  return { app_state: state.app_state };
};


function mapDispatchToProps(dispatch) {
    return({
        setAppState: (app_state) => {dispatch(setAppState(app_state))}
    })
}

const Header = (props) => {
  const classes = useStyles();

  const [state, setState] = React.useState({
    left: false,
//    right: false
  });

  const toggleDrawer = (side, isOpen) => event => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setState({ ...state, [side]: isOpen });
  };

  return (
    <div className={classes.appBar}>
      <AppBar
        position='fixed'
        className={props.reviewDrawerState ? classes.barWithReviewDrawer : classes.barFullWidth}
      >
        <Toolbar>
          <IconButton
            className={classes.menuButton}
            edge="start"
            color="inherit"
            onClick={toggleDrawer('left', true)}
          >
            <Menu />
          </IconButton>
          <ElasIcon/>
          <Typography
            variant="h5"
            color="inherit"
            className={classes.appTitle}
          >
             ASReview
          </Typography>

          {(props.app_state === 'review') ?
            <IconButton
              aria-label="History"
              onClick={props.handleHistoryOpen}
              color="inherit"
            >
              <HistoryIcon />
            </IconButton>
          :''
          }
          <IconButton
            aria-label="Settings"
            onClick={props.handleClickOpen}
            color="inherit"
          >
            <SettingsIcon />
          </IconButton>

          {(props.app_state === 'review' && !props.reviewDrawerState)?<IconButton
            color="inherit"
            className={classes.barChart}
            onClick={(e) => props.handleReviewDrawer(true)}
          >
            <BarChart />
          </IconButton>
          :''
          }
        </Toolbar>
      </AppBar>
      <Toolbar />
      <MenuDrawer
        state={state}
        setMenuDrawerState={setState}

        toggleDrawer={toggleDrawer}
        toggleExit={props.toggleExit}
        toggleExportResult={props.toggleExportResult}
        toggleImportProject={props.toggleImportProject}
      />
    </div>
  )
}

export default connect(mapStateToProps)(Header);
