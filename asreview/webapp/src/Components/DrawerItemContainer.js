import React from "react";
import { connect } from "react-redux";
import {
  Divider,
  Fade,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { Help, Payment, Settings } from "@mui/icons-material";

import { DrawerItem } from "../Components";

import { donateURL } from "../globals.js";

const PREFIX = "DrawerItemContainer";

const classes = {
  topSection: `${PREFIX}-topSection`,
  bottomSection: `${PREFIX}-bottomSection`,
  icon: `${PREFIX}-icon`,
  projectInfo: `${PREFIX}-projectInfo`,
  yourProject: `${PREFIX}-yourProject`,
  projectTitle: `${PREFIX}-projectTitle`,
  stateElas: `${PREFIX}-stateElas`,
};

const StyledList = styled(List)(({ theme }) => ({
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
  flexGrow: 1,
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
    nav_state: state.nav_state,
  };
};

const DrawerItemContainer = (props) => {
  /**
   * Drawer items on home page
   * Any change here requires change in StyledDrawerItem
   */
  const drawerItemsHomePage = [
    {
      value: "dashboard",
      label: "Dashboard",
    },
  ];
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

  return (
    <StyledList aria-label="drawer item container">
      {/* Top Section: Home page drawer */}
      {props.app_state === "home" && (
        <Fade in={props.app_state === "home"}>
          <div className={classes.topSection}>
            {drawerItemsHomePage.map((element, index) => {
              return (
                <DrawerItem
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

      {/* Top Section: Project page drawer */}
      {props.app_state === "project-page" && (
        <Fade
          in={props.app_state === "project-page" && props.projectInfo !== null}
        >
          <div className={classes.topSection}>
            <DrawerItem
              mobileScreen={props.mobileScreen}
              label="Dashboard"
              value="dashboard"
              onNavDrawer={props.onNavDrawer}
              toggleNavDrawer={props.toggleNavDrawer}
              state={props.app_state}
              setState={props.handleAppState}
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
                <DrawerItem
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
    </StyledList>
  );
};

export default connect(mapStateToProps)(DrawerItemContainer);
