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
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";
import { Help, Menu, Payment, Settings } from "@mui/icons-material";

import { StyledDrawerItem } from "../Components";

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
    [`& :after`]: {
      top: 0,
      left: 0,
      width: 4,
      height: "100%",
      content: "' '",
      position: "absolute",
      backgroundColor: "#91620b",
    },
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

  /**
   * Drawer items on project page
   * Any change here requires change in StyledDrawerItem
   */
  const drawerItemsProjectPage = [
    {
      value: "analytics",
      label: "Analytics",
    },
    {
      value: "review",
      label: "Review",
    },
    {
      value: "history",
      label: "History",
    },
    {
      value: "export",
      label: "Export",
    },
    {
      value: "details",
      label: "Details",
    },
  ];

  const drawer = (
    <List className={classes.drawerContainer}>
      {/* Top Section: Top level drawer */}
      {props.app_state === "dashboard" && (
        <Fade in={props.app_state === "dashboard"}>
          <div className={classes.topSection}>
            <StyledDrawerItem
              mobileScreen={props.mobileScreen}
              label="Dashboard"
              value="dashboard"
              onNavDrawer={props.onNavDrawer}
              toggleNavDrawer={props.toggleNavDrawer}
              state={props.app_state}
              setState={props.setAppState}
            />
          </div>
        </Fade>
      )}

      {/* Top Section: Project page drawer */}
      {props.app_state === "project-page" && (
        <Fade
          in={props.app_state === "project-page" && props.projectInfo !== null}
        >
          <div className={classes.topSection}>
            <StyledDrawerItem
              mobileScreen={props.mobileScreen}
              label="Dashboard"
              value="dashboard"
              onNavDrawer={props.onNavDrawer}
              toggleNavDrawer={props.toggleNavDrawer}
              state={props.app_state}
              setState={props.setAppState}
            />
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
            {drawerItemsProjectPage.map((element, index) => {
              return (
                <StyledDrawerItem
                  key={index}
                  value={element.value}
                  label={element.label}
                  mobileScreen={props.mobileScreen}
                  onNavDrawer={props.onNavDrawer}
                  toggleNavDrawer={props.toggleNavDrawer}
                  state={props.nav_state}
                  setState={props.handleNavState}
                />
              );
            })}
          </div>
        </Fade>
      )}

      {/* Bottom Section */}
      <div className={classes.bottomSection}>
        <Divider />
        {donateURL !== undefined && (
          <Tooltip disableHoverListener={props.onNavDrawer} title="Donate">
            <ListItemButton
              component={"a"}
              color="inherit"
              href={donateURL}
              target="_blank"
            >
              <ListItemIcon className={classes.icon}>
                <Payment />
              </ListItemIcon>
              <ListItemText primary="Donate" />
            </ListItemButton>
          </Tooltip>
        )}
        <Tooltip disableHoverListener={props.onNavDrawer} title="Settings">
          <ListItemButton
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
          </ListItemButton>
        </Tooltip>
        <Tooltip disableHoverListener={props.onNavDrawer} title="Help">
          <ListItemButton
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
          </ListItemButton>
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
                  props.setAppState("dashboard");
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
