import React, { } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Tooltip,
} from '@material-ui/core'
import MenuDrawer from './MenuDrawer'
import { reviewDrawerWidth } from '../globals.js'

import {
  Menu,
  BarChart,
  GetApp,
} from '@material-ui/icons'
import SettingsIcon from '@material-ui/icons/Settings';

import { connect } from "react-redux";

// redux config
import { toggleReviewDrawer } from '../redux/actions'


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
  return {
    app_state: state.app_state,
    reviewDrawerOpen: state.reviewDrawerOpen,
  };
};


function mapDispatchToProps(dispatch) {
    return({
        toggleReviewDrawer: () => {dispatch(toggleReviewDrawer())}
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
        className={
          (props.reviewDrawerOpen && props.app_state === "review") ?
          classes.barWithReviewDrawer :
          classes.barFullWidth
        }
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

        {/*
          <ElasIcon/>
          <Typography
            variant="h5"
            color="inherit"
            className={classes.appTitle}
          >
             ASReview
          </Typography>
        */}


            <Typography
              variant="h5"
              color="inherit"
              className={classes.appTitle}
            >
              {(props.app_state === 'review') &&
                "Review"
              }
              {(props.app_state === 'project-page') &&
                "Project Dashboard"
              }
            </Typography>

          {(props.app_state === 'review') &&
            <Tooltip title="Download results">
              <IconButton
                aria-label="Export"
                onClick={props.toggleExportResult}
                color="inherit"
              >
                <GetApp />
              </IconButton>
            </Tooltip>
          }
          <IconButton
            aria-label="Settings"
            onClick={props.handleClickOpen}
            color="inherit"
          >
            <SettingsIcon />
          </IconButton>

          {(props.app_state === 'review' && !props.reviewDrawerOpen)?<IconButton
            color="inherit"
            className={classes.barChart}
            onClick={props.toggleReviewDrawer}
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
      />
    </div>
  )
}

export default connect(mapStateToProps, mapDispatchToProps)(Header);
