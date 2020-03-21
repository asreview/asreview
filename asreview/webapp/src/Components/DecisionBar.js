import React, { useState, useEffect } from 'react'
import BottomNavigation from '@material-ui/core/BottomNavigation';
import BottomNavigationAction from '@material-ui/core/BottomNavigationAction';
import FavoriteIcon from '@material-ui/icons/Favorite';
import CloseIcon from '@material-ui/icons/Close';
import { makeStyles } from '@material-ui/core/styles'
import { reviewDrawerWidth } from './globals'

const useStyles = makeStyles({
  barFullWidth: {
    width: '100%',
    position: 'fixed',
    bottom: 0,
    boxShadow: '0 -1px 1px 0 rgba(0,0,0,.1)',
    // fontSize: '.53rem',
    // fontWeight: 500,
    // textDecoration: 'none',
    paddingRight: 0,
  },
  barWithDrawer: {
    width: '100%',
    position: 'fixed',
    bottom: 0,
    boxShadow: '0 -1px 1px 0 rgba(0,0,0,.1)',
    paddingRight: reviewDrawerWidth,
  }
});

const DecisionBar = (props) => {
  const classes = useStyles();

  return (
    <BottomNavigation
      // value={value}
      onChange={(event, newValue) => {
        if (newValue === 0) {
          props.classify(0);
        } else if (newValue ===1) {
          props.classify(1);
        }
      }}
      showLabels
      className={props.reviewDrawerState?classes.barWithDrawer:classes.barFullWidth}
    >
      <BottomNavigationAction label="Irrelevant" icon={<CloseIcon />} disabled={props.block} />
      <BottomNavigationAction label="Relevant" icon={<FavoriteIcon />} disabled={props.block} />
    </BottomNavigation>
  )
}

export default DecisionBar;

