import React from "react";
import { connect } from "react-redux";
import {
  Button,
  Drawer,
  Hidden,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { Dashboard, Help, Menu, Payment, Settings } from "@material-ui/icons";

import ASReviewLogo from "../images/Wordmark_LAB_colour.svg";
import { donateURL, drawerWidth } from "../globals.js";

import { setAppState } from "../redux/actions";

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
  };
}

const useStyles = makeStyles((theme) => ({
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
  },
  drawerContainer: {
    overflow: "auto",
  },
  menuButton: {
    marginRight: 4,
  },
  logo: {
    width: 130,
  },
  selectedIcon: {
    color: "#91620B",
  },
  selectedText: {
    fontWeight: 600,
  },
}));

const NavigationDrawer = (props) => {
  const classes = useStyles();

  const isTempDrawer = () => {
    return props.mobileScreen || props.app_state !== "projects";
  };

  const drawer = (
    <div className={classes.drawerContainer}>
      <List>
        <ListItem
          className={
            props.app_state === "projects" ? "navDrawerSelected" : null
          }
          button
          divider
          selected={props.app_state === "projects"}
          onClick={() => {
            props.toggleNavDrawer();
            props.setAppState("projects");
          }}
        >
          <ListItemIcon
            className={
              props.app_state === "projects" ? classes.selectedIcon : null
            }
          >
            <Dashboard />
          </ListItemIcon>
          <ListItemText
            primary="Dashboard"
            primaryTypographyProps={{
              className:
                props.app_state === "projects" ? classes.selectedText : null,
            }}
          />
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
          key="menu-button-settings"
          onClick={() => {
            if (isTempDrawer()) {
              props.toggleNavDrawer();
            }
            props.toggleSettings();
          }}
        >
          <ListItemIcon>
            <Settings />
          </ListItemIcon>
          <ListItemText primary="Settings" />
        </ListItem>
        <ListItem
          button
          key="menu-button-help"
          onClick={() => {
            if (isTempDrawer()) {
              props.toggleNavDrawer();
            }
            props.toggleHelp();
          }}
        >
          <ListItemIcon>
            <Help />
          </ListItemIcon>
          <ListItemText primary="Help" />
        </ListItem>
      </List>
    </div>
  );

  return (
    <nav className={classes.drawer}>
      <Hidden smUp implementation="css">
        <Drawer
          variant="temporary"
          anchor="left"
          open={isTempDrawer() && props.onNavDrawer}
          onClose={props.toggleNavDrawer}
          classes={{
            paper: classes.drawerPaper,
          }}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
        >
          <Toolbar>
            <IconButton
              className={classes.menuButton}
              edge="start"
              color="inherit"
              onClick={props.toggleNavDrawer}
            >
              <Menu />
            </IconButton>
            <Button disableRipple style={{ backgroundColor: "transparent" }}>
              <img
                className={classes.logo}
                src={ASReviewLogo}
                alt="ASReview LAB Dashboard"
                onClick={() => {
                  props.toggleNavDrawer();
                  props.setAppState("projects");
                }}
              />
            </Button>
          </Toolbar>
          {drawer}
        </Drawer>
      </Hidden>
      <Hidden xsDown implementation="css">
        <Drawer
          variant="persistent"
          anchor="left"
          open={
            !props.mobileScreen &&
            props.app_state === "projects" &&
            props.onNavDrawer
          }
          classes={{
            paper: classes.drawerPaper,
          }}
        >
          <Toolbar />
          {drawer}
        </Drawer>
      </Hidden>
    </nav>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(NavigationDrawer);
