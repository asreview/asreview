import React, { } from 'react'
import BottomNavigation from '@material-ui/core/BottomNavigation';
import BottomNavigationAction from '@material-ui/core/BottomNavigationAction';
import FavoriteIcon from '@material-ui/icons/Favorite';
import CloseIcon from '@material-ui/icons/Close';
import { makeStyles } from '@material-ui/core/styles'
import { reviewDrawerWidth } from '../globals.js'

const useStyles = makeStyles(theme => ({
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
  },
  unselectedAction: {}, 
  selectedAction: {
    color: theme.palette.secondary.main
  },
}));

const DecisionBar = (props) => {
  const classes = useStyles(props);

  let relevantLabel = "Relevant"
  let irrelevantLabel = "Irrelevant"

  if (props.recordState.selection === 0) {
    relevantLabel = "Convert to relevant"
    irrelevantLabel = "Keep irrelevant"
  }
  if (props.recordState.selection === 1) {
    relevantLabel = "Keep relevant"
    irrelevantLabel = "Convert to irrelevant"
  }

  let irreleventClassName = props.recordState.selection === 0 ? classes.selectedAction : classes.unselectedAction
  let releventClassName = props.recordState.selection === 1 ? classes.selectedAction : classes.unselectedAction

  return (
    <BottomNavigation
      // value={value}
      onChange={(event, newValue) => {
        props.makeDecision(newValue)
      }}
      showLabels
      className={props.reviewDrawerState?classes.barWithDrawer:classes.barFullWidth}
    >
      <BottomNavigationAction
        className={irreleventClassName}  
        label={irrelevantLabel}
        icon={<CloseIcon />} 
        disabled={props.block} 
      />

      <BottomNavigationAction 
        className={releventClassName}  
        label={relevantLabel}
        icon={<FavoriteIcon />} 
        disabled={props.block} 
      />

    </BottomNavigation>    
  )  
}
export default DecisionBar;

