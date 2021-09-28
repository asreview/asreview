import React from "react";
import { connect } from "react-redux";
import clsx from "clsx";
import {
  ButtonBase,
  Box,
  Divider,
  Drawer,
  Fade,
  Hidden,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";
import {
  ArrowBack,
  Assignment,
  Assessment,
  Dashboard,
  Edit,
  GetApp,
  Help,
  History,
  Menu,
  Payment,
  Settings,
} from "@mui/icons-material";

import ASReviewLAB_black from "../images/asreview_sub_logo_lab_black_transparent.svg";
import ASReviewLAB_white from "../images/asreview_sub_logo_lab_white_transparent.svg";
import { donateURL, drawerWidth } from "../globals.js";
import { setAppState, toggleHelpDialog } from "../redux/actions";

const PREFIX = "NavigationDrawer";

const classes = {
  drawer: `${PREFIX}-drawer`,
  drawerOpen: `${PREFIX}-drawerOpen`,
  drawerClose: `${PREFIX}-drawerClose`,
  drawerPaper: `${PREFIX}-drawerPaper`,
  drawerContainer: `${PREFIX}-drawerContainer`,
  menuIcon: `${PREFIX}-menuIcon`,
  logo: `${PREFIX}-logo`,
  topSection: `${PREFIX}-topSection`,
  bottomSection: `${PREFIX}-bottomSection`,
  icon: `${PREFIX}-icon`,
  selectedIcon: `${PREFIX}-selectedIcon`,
  selectedText: `${PREFIX}-selectedText`,
  projectInfo: `${PREFIX}-projectInfo`,
  yourProject: `${PREFIX}-yourProject`,
  projectTitle: `${PREFIX}-projectTitle`,
  stateElas: `${PREFIX}-stateElas`,
};

const StyledBox = styled(Box)(({ theme }) => ({
  [`&.${classes.drawer}`]: {
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: "nowrap",
  },

  [`& .${classes.drawerOpen}`]: {
    width: drawerWidth,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },

  [`& .${classes.drawerClose}`]: {
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

  [`& .${classes.drawerPaper}`]: {
    width: drawerWidth,
  },

  [`& .${classes.drawerContainer}`]: {
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
  },

  [`& .${classes.menuIcon}`]: {
    marginRight: 4,
  },

  [`& .${classes.logo}`]: {
    width: 130,
  },

  [`& .${classes.topSection}`]: {
    overflowX: "hidden",
    overflowY: "auto",
    flex: "1 1 auto",
  },

  [`& .${classes.bottomSection}`]: {
    overflow: "hidden",
    flex: "0 0 auto",
  },

  [`& .${classes.icon}`]: {
    paddingLeft: 8,
  },

  [`& .${classes.selectedIcon}`]: {
    paddingLeft: 8,
    color: "#91620B",
  },

  [`& .${classes.selectedText}`]: {
    fontWeight: 600,
  },

  [`& .${classes.projectInfo}`]: {
    display: "block",
    "& > *": {
      marginTop: theme.spacing(2),
    },
  },

  [`& .${classes.yourProject}`]: {
    paddingLeft: 12,
    paddingRight: 12,
  },

  [`& .${classes.projectTitle}`]: {
    display: "-webkit-box",
    WebkitBoxOrient: "vertical",
    WebkitLineClamp: 2,
    whiteSpace: "pre-line",
    overflow: "hidden",
  },

  [`& .${classes.stateElas}`]: {
    width: "100%",
    maxWidth: "140px",
    display: "block",
    margin: "auto",
  },
}));

const mapStateToProps = (state) => {
  return {
    app_state: state.app_state,
    project_id: state.project_id,
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

const NavigationDrawer = (props) => {
  const { window } = props;

  const theme = useTheme();

  const wordmarkState = () => {
    if (theme.palette.mode === "dark") {
      return ASReviewLAB_white;
    } else {
      return ASReviewLAB_black;
    }
  };

  const drawer = (
    <List className={classes.drawerContainer}>
      {/* Top Section: Top level drawer */}
      {props.app_state === "projects" && (
        <Fade in={props.app_state === "projects"}>
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
                      props.app_state === "projects"
                        ? classes.selectedText
                        : null,
                  }}
                />
              </ListItem>
            </Tooltip>
          </div>
        </Fade>
      )}

      {/* Top Section: Project page drawer */}
      {props.app_state === "project-page" && (
        <Fade
          in={props.app_state === "project-page" && props.projectInfo !== null}
        >
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
                <ListItemIcon className={classes.icon}>
                  <ArrowBack />
                </ListItemIcon>
                <ListItemText primary="Dashboard" />
              </ListItem>
            </Tooltip>
            <ListItem className={classes.projectInfo}>
              <img
                src={props.returnElasState()}
                alt="ElasState"
                className={classes.stateElas}
              />
              <Fade in={props.onNavDrawer} unmountOnExit>
                <div className={classes.yourProject}>
                  <Typography variant="subtitle2">Your project</Typography>
                  <Typography
                    className={classes.projectTitle}
                    variant="body2"
                    color="textSecondary"
                  >
                    {props.projectInfo ? props.projectInfo.name : null}
                  </Typography>
                </div>
              </Fade>
            </ListItem>
            <Tooltip disableHoverListener={props.onNavDrawer} title="Analytics">
              <ListItem
                button
                selected={props.nav_state === "analytics"}
                onClick={() => {
                  if (props.mobileScreen) {
                    props.toggleNavDrawer();
                  }
                  props.handleNavState("analytics");
                }}
              >
                <ListItemIcon
                  className={
                    props.nav_state === "analytics"
                      ? clsx(classes.selectedIcon, "navDrawerSelected")
                      : classes.icon
                  }
                >
                  <Assessment />
                </ListItemIcon>
                <ListItemText
                  primary="Analytics"
                  primaryTypographyProps={{
                    className:
                      props.nav_state === "analytics"
                        ? classes.selectedText
                        : null,
                  }}
                />
              </ListItem>
            </Tooltip>
            <Tooltip disableHoverListener={props.onNavDrawer} title="Review">
              <ListItem
                button
                selected={props.nav_state === "review"}
                onClick={() => {
                  if (props.mobileScreen) {
                    props.toggleNavDrawer();
                  }
                  props.handleNavState("review");
                }}
              >
                <ListItemIcon
                  className={
                    props.nav_state === "review"
                      ? clsx(classes.selectedIcon, "navDrawerSelected")
                      : classes.icon
                  }
                >
                  <Assignment />
                </ListItemIcon>
                <ListItemText
                  primary="Review"
                  primaryTypographyProps={{
                    className:
                      props.nav_state === "review"
                        ? classes.selectedText
                        : null,
                  }}
                />
              </ListItem>
            </Tooltip>
            <Tooltip disableHoverListener={props.onNavDrawer} title="History">
              <ListItem
                button
                selected={props.nav_state === "history"}
                onClick={() => {
                  if (props.mobileScreen) {
                    props.toggleNavDrawer();
                  }
                  props.handleNavState("history");
                }}
              >
                <ListItemIcon
                  className={
                    props.nav_state === "history"
                      ? clsx(classes.selectedIcon, "navDrawerSelected")
                      : classes.icon
                  }
                >
                  <History />
                </ListItemIcon>
                <ListItemText
                  primary="History"
                  primaryTypographyProps={{
                    className:
                      props.nav_state === "history"
                        ? classes.selectedText
                        : null,
                  }}
                />
              </ListItem>
            </Tooltip>
            <Tooltip disableHoverListener={props.onNavDrawer} title="Export">
              <ListItem
                button
                selected={props.nav_state === "export"}
                onClick={() => {
                  if (props.mobileScreen) {
                    props.toggleNavDrawer();
                  }
                  props.handleNavState("export");
                }}
              >
                <ListItemIcon
                  className={
                    props.nav_state === "export"
                      ? clsx(classes.selectedIcon, "navDrawerSelected")
                      : classes.icon
                  }
                >
                  <GetApp />
                </ListItemIcon>
                <ListItemText
                  primary="Export"
                  primaryTypographyProps={{
                    className:
                      props.nav_state === "export"
                        ? classes.selectedText
                        : null,
                  }}
                />
              </ListItem>
            </Tooltip>
            <Tooltip disableHoverListener={props.onNavDrawer} title="Details">
              <ListItem
                button
                selected={props.nav_state === "details"}
                onClick={() => {
                  if (props.mobileScreen) {
                    props.toggleNavDrawer();
                  }
                  props.handleNavState("details");
                }}
              >
                <ListItemIcon
                  className={
                    props.nav_state === "details"
                      ? clsx(classes.selectedIcon, "navDrawerSelected")
                      : classes.icon
                  }
                >
                  <Edit />
                </ListItemIcon>
                <ListItemText
                  primary="Details"
                  primaryTypographyProps={{
                    className:
                      props.nav_state === "details"
                        ? classes.selectedText
                        : null,
                  }}
                />
              </ListItem>
            </Tooltip>
          </div>
        </Fade>
      )}

      {/* Bottom Section */}
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

  return (
    <StyledBox
      component="nav"
      className={classes.drawer}
      aria-label="navigation drawer"
    >
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
              size="large"
            >
              <Menu />
            </IconButton>
            <ButtonBase disableRipple>
              <img
                className={classes.logo}
                src={wordmarkState()}
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
      <Hidden mdDown implementation="css">
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
    </StyledBox>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(NavigationDrawer);
