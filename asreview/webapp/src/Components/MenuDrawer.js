import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@material-ui/core";
import { Folder, Help, ExitToApp, Payment, Settings } from "@material-ui/icons";

// local imports
import ElasIcon from "../ElasIcon";
import ASReviewLogo from "../images/Wordmark_LAB_colour.svg";

import { connect } from "react-redux";

// redux config
import { setAppState, toggleHelpDialog } from "../redux/actions";

import { donateURL } from "../globals.js";

const mapStateToProps = (state) => {
  return {
    app_state: state.app_state,
  };
};

function mapDispatchToProps(dispatch) {
  return {
    setAppState: (app_state) => {
      dispatch(setAppState(app_state));
    },
    toggleHelpDialog: () => {
      dispatch(toggleHelpDialog());
    },
  };
}

const drawerWidth = 250;

const useStyles = makeStyles({
  list: {
    width: drawerWidth,
  },
  logo: {
    width: 180,
  },
  centerListItem: {
    textAlign: "center",
  },
});

const MenuDrawer = (props) => {
  const classes = useStyles();

  return (
    <Drawer
      anchor="left"
      open={props.state.left}
      onClose={props.toggleDrawer("left", false)}
      variant="temporary"
    >
      <div className={classes.list} role="presentation">
        <List>
          <ListItem
            button
            key="menu-button-asreview"
            onClick={() => {
              props.setMenuDrawerState({ left: false });
              props.setAppState("projects");
            }}
          >
            <ListItemText
              className={classes.centerListItem}
              primary={
                <img
                  src={ASReviewLogo}
                  alt="ASReview"
                  className={classes.logo}
                />
              }
            />
          </ListItem>
          <Divider />
          <ListItem
            button
            key="menu-button-home"
            onClick={() => {
              props.setMenuDrawerState({ left: false });
              props.setAppState("projects");
            }}
          >
            <ListItemIcon>
              <ElasIcon />
            </ListItemIcon>
            <ListItemText primary="Home" />
          </ListItem>
          <ListItem
            button
            selected={props.app_state === "project-page"}
            disabled={props.app_state !== "review"}
            key="menu-button-project"
            onClick={() => {
              props.setMenuDrawerState({ left: false });
              props.setAppState("project-page");
            }}
          >
            <ListItemIcon>
              <Folder />
            </ListItemIcon>
            <ListItemText primary="Project Dashboard" />
          </ListItem>
          <ListItem
            button
            key="menu-button-settings"
            onClick={() => {
              props.setMenuDrawerState({ left: false });
              props.toggleSettings();
            }}
          >
            <ListItemIcon>
              <Settings />
            </ListItemIcon>
            <ListItemText primary="Settings" />
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
            onClick={() => {
              props.setMenuDrawerState({ left: false });
              props.toggleHelpDialog();
            }}
          >
            <ListItemIcon>
              <Help />
            </ListItemIcon>
            <ListItemText primary="Help" />
          </ListItem>
          {donateURL !== undefined && (
            <ListItem
              button
              key="menu-button-donate"
              component={"a"}
              color="inherit"
              href={donateURL}
              target="_blank"
            >
              <ListItemIcon>
                <Payment />
              </ListItemIcon>
              <ListItemText primary="Donate" />
            </ListItem>
          )}
          <ListItem
            button
            key="menu-button-exit"
            onClick={() => {
              props.toggleExit();
              props.setMenuDrawerState({ left: false });
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
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(MenuDrawer);
