import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import {
  Drawer,
  Link,
  List,
  ListSubheader,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@material-ui/core'
import {
  Add,
  Folder,
  Help,
  Feedback,
  ExitToApp,
  GetApp,
  Publish,
  Payment,
} from '@material-ui/icons'

// local imports
// import ElasIcon from '../ElasIcon'

import { donateURL } from '../globals.js';

const drawerWidth = 250;

const useStyles = makeStyles({
  list: {
    width: drawerWidth
  },
});

const MenuDrawer = (props) => {
  const classes = useStyles();

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
          <ListSubheader component="div" id="list-subheader-projects">
            Projects
          </ListSubheader>
          <ListItem
            button
            key="menu-button-new-projects"
            onClick={() => {
              props.setMenuDrawerState({left: false});
              props.handleAppState("review-init");
            }}
          >
            <ListItemIcon><Add /></ListItemIcon>
            <ListItemText primary="New" />
          </ListItem>
          <ListItem
            button
            key="menu-button-import-projects"
            onClick={() => {
              props.setMenuDrawerState({left: false});
              props.handleAppState("review-import");
              props.toggleImportProject();
            }}
            >
            <ListItemIcon><Publish /></ListItemIcon>
            <ListItemText primary="Import" />
          </ListItem>
          <ListItem
            button
            key="menu-button-projects"
            onClick={() => {
              props.setMenuDrawerState({left: false});
              props.handleAppState("projects");
            }}
            >
            <ListItemIcon><Folder /></ListItemIcon>
            <ListItemText primary="Projects" />
          </ListItem>
          <ListItem
            button
            key="menu-button-export"
            disabled={props.appState === "review" ? false : true}
            onClick={() => {
              props.toggleExportResult();
              props.setMenuDrawerState({left: false});
            }}
          >
            <ListItemIcon><GetApp /></ListItemIcon>
            <ListItemText primary="Export" />
          </ListItem>
          <Divider />

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

        {/* help and quit */}
          <ListSubheader component="div" id="list-subheader-help">
            Help & Quit
          </ListSubheader>
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

export default MenuDrawer;
