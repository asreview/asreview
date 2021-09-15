import React from "react";
import { connect } from "react-redux";
import clsx from "clsx";
import {
  ButtonBase,
  Divider,
  Drawer,
  Hidden,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Tooltip,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { Dashboard, Help, Menu, Payment, Settings } from "@material-ui/icons";

import ASReviewLogo from "../images/asreview_sub_logo_lab_white_transparent.svg";
import { donateURL, drawerWidth } from "../globals.js";

import { setAppState, toggleHelpDialog } from "../redux/actions";

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

const useStyles = makeStyles((theme) => ({
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: "nowrap",
  },
  drawerOpen: {
    width: drawerWidth,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerClose: {
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: "hidden",
    width: theme.spacing(7) + 1,
    [theme.breakpoints.up("sm")]: {
      width: theme.spacing(9) + 1,
    },
  },
  drawerPaper: {
    width: drawerWidth,
  },
  drawerContainer: {
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
  },
  menuIcon: {
    marginRight: 4,
  },
  logo: {
    width: 130,
  },
  topSection: {
    overflowX: "hidden",
    overflowY: "auto",
    flex: "1 1 auto",
  },
  bottomSection: {
    overflow: "hidden",
    flex: "0 0 auto",
  },
  icon: {
    paddingLeft: 8,
  },
  selectedIcon: {
    paddingLeft: 8,
    color: "#91620B",
  },
  selectedText: {
    fontWeight: 600,
  },
}));

const NavigationDrawer = (props) => {
  const { window } = props;
  const classes = useStyles();

  const drawer = (
    <List className={classes.drawerContainer}>
      <div className={classes.topSection}>
        <Tooltip disableHoverListener={props.onNavDrawer} title="Dashboard">
          <ListItem
            button
            selected={props.app_state === "projects"}
            onClick={() => {
              if (props.mobileScreen) {
                props.toggleNavDrawer();
              }
              props.setAppState("projects");
            }}
          >
            <ListItemIcon
              className={
                props.app_state === "projects"
                  ? clsx(classes.selectedIcon, "navDrawerSelected")
                  : classes.icon
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
        </Tooltip>
      </div>

      <div className={classes.bottomSection}>
        <Divider />
        {donateURL !== undefined && (
          <Tooltip disableHoverListener={props.onNavDrawer} title="Donate">
            <ListItem
              button
              key="menu-button-donate"
              component={"a"}
              color="inherit"
              href={donateURL}
              target="_blank"
            >
              <ListItemIcon className={classes.icon}>
                <Payment />
              </ListItemIcon>
              <ListItemText primary="Donate" />
            </ListItem>
          </Tooltip>
        )}
        <Tooltip disableHoverListener={props.onNavDrawer} title="Settings">
          <ListItem
            button
            key="menu-button-settings"
            onClick={() => {
              if (props.mobileScreen) {
                props.toggleNavDrawer();
              }
              props.toggleSettings();
            }}
          >
            <ListItemIcon className={classes.icon}>
              <Settings />
            </ListItemIcon>
            <ListItemText primary="Settings" />
          </ListItem>
        </Tooltip>
        <Tooltip disableHoverListener={props.onNavDrawer} title="Help">
          <ListItem
            button
            key="menu-button-help"
            onClick={() => {
              if (props.mobileScreen) {
                props.toggleNavDrawer();
              }
              props.toggleHelpDialog();
            }}
          >
            <ListItemIcon className={classes.icon}>
              <Help />
            </ListItemIcon>
            <ListItemText primary="Help" />
          </ListItem>
        </Tooltip>
      </div>
    </List>
  );

  const container =
    window !== undefined ? () => window().document.body : undefined;

  console.log(props.onNavDrawer);

  return (
    <nav className={classes.drawer}>
      {/* Temporary drawer on mobile screen */}
      <Hidden mdUp implementation="css">
        <Drawer
          container={container}
          variant="temporary"
          anchor="left"
          open={props.mobileScreen && props.onNavDrawer}
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
              className={classes.menuIcon}
              edge="start"
              color="inherit"
              onClick={props.toggleNavDrawer}
            >
              <Menu />
            </IconButton>
            <ButtonBase disableRipple>
              <img
                className={classes.logo}
                src={ASReviewLogo}
                alt="ASReview LAB Dashboard"
                onClick={() => {
                  props.toggleNavDrawer();
                  props.setAppState("projects");
                }}
              />
            </ButtonBase>
          </Toolbar>
          {drawer}
        </Drawer>
      </Hidden>

      {/* Permanent drawer on desktop screen */}
      <Hidden smDown implementation="css">
        <Drawer
          className={clsx({
            [classes.drawerOpen]: props.onNavDrawer,
            [classes.drawerClose]: !props.onNavDrawer,
          })}
          variant="permanent"
          anchor="left"
          classes={{
            paper: clsx({
              [classes.drawerOpen]: props.onNavDrawer,
              [classes.drawerClose]: !props.onNavDrawer,
            }),
          }}
          open
        >
          <Toolbar />
          {drawer}
        </Drawer>
      </Hidden>
    </nav>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(NavigationDrawer);
