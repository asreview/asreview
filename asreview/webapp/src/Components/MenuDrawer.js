import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import {
  Drawer,
  Link,
  List,
  // ListSubheader,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@material-ui/core'
import {
  Folder,
  Help,
  Feedback,
  ExitToApp,
  Payment,
} from '@material-ui/icons'

// local imports
import ElasIcon from '../ElasIcon'
import ASReviewLogo from '../images/Wordmark_LAB_colour.svg'

import { donateURL } from '../globals.js';

import { connect } from "react-redux";

// redux config
import { setAppState } from '../redux/actions'


const mapStateToProps = state => {
  return {
    asreview_version: state.asreview_version,
    app_state: state.app_state
  };
};


function mapDispatchToProps(dispatch) {
    return({
        setAppState: (app_state) => {dispatch(setAppState(app_state))}
    })
}

const drawerWidth = 250;

const useStyles = makeStyles({
  list: {
    width: drawerWidth
  },
  logo: {
    width: 180,
  },
  centerListItem: {
    textAlign: "center",
  }
});

const MenuDrawer = (props) => {
  const classes = useStyles();

  console.log(props.asreview_version)

  return (
    <Drawer
      anchor='left'
      open={props.state.left}
      onClose={props.toggleDrawer('left',false)}
      variant='temporary'
    >
      <div
        className={classes.list}
        role="presentation"
      >
        <List>
          <ListItem
            button
            key="menu-button-asreview"
            onClick={() => {
              props.setMenuDrawerState({left: false});
              props.setAppState("projects");
            }}
            >
            <ListItemText
              className={classes.centerListItem}
              primary={<img
                src={ASReviewLogo}
                alt="ASReview"
                className={classes.logo}
              />}
              secondary={props.asreview_version}
            />
          </ListItem>
          <Divider />
          <ListItem
            button
            key="menu-button-home"
            onClick={() => {
              props.setMenuDrawerState({left: false});
              props.setAppState("projects");
            }}
            >
            <ListItemIcon><ElasIcon /></ListItemIcon>
            <ListItemText primary="Home" />
          </ListItem>
          <ListItem
            button
            selected={props.app_state === "project-page"}
            disabled={props.app_state !== "review"}
            key="menu-button-project"
            onClick={() => {
              props.setMenuDrawerState({left: false});
              props.setAppState("project-page");
            }}
          >
            <ListItemIcon><Folder /></ListItemIcon>
            <ListItemText primary="Current Project" />
          </ListItem>

        {/* Documentation */}

          {/*
          <ListSubheader component="div" id="list-subheader-getting-started">
            Getting started
          </ListSubheader>
          <ListItem button key="menu-button-quicktour">
            <ListItemIcon><Folder /></ListItemIcon>
            <ListItemText primary="Quick Tour" />
          </ListItem>
          <ListItem button key="menu-button-scientific">
            <ListItemIcon><ElasIcon /></ListItemIcon>
            <ListItemText primary="How this works" />
          </ListItem>
          <Divider />
          */}

          <ListItem
            button
            key="menu-button-help"
            component={Link}
            color="inherit"
            href="https://asreview.readthedocs.io/"
            target="_blank"
          >
            <ListItemIcon><Help /></ListItemIcon>
            <ListItemText primary="Help" />
          </ListItem>
          <ListItem
            button
            key="menu-button-feedback"
            component={Link}
            color="inherit"
            href="https://github.com/asreview/asreview/blob/master/CONTRIBUTING.md"
            target="_blank"
          >
            <ListItemIcon><Feedback/></ListItemIcon>
            <ListItemText primary="Feedback" />
          </ListItem>

          {donateURL !== undefined &&
            <ListItem
              button
              key="menu-button-donate"
              component={Link}
              color="inherit"
              href={donateURL}
              target="_blank"
            >
              <ListItemIcon><Payment/></ListItemIcon>
              <ListItemText primary="Sponsor ASReview" />
            </ListItem>
          }

          <ListItem
            button
            key="menu-button-exit"
            onClick={() => {
              props.toggleExit();
              props.setMenuDrawerState({left: false});
            }}
          >
            <ListItemIcon>
              <ExitToApp />
            </ListItemIcon>
            <ListItemText primary="Quit" />
          </ListItem>
        </List>
      </div>
    </Drawer>
  )
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MenuDrawer);
