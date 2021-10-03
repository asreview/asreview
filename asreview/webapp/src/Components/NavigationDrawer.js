import React from "react";
import { connect } from "react-redux";
import {
  ButtonBase,
  Divider,
  Drawer,
  Fade,
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

const Root = styled("div")(({ theme }) => ({
  [`&.${classes.drawer}`]: {
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: "nowrap",
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

const mapDispatchToProps = (dispatch) => {
  return {
    setAppState: (app_state) => {
      dispatch(setAppState(app_state));
    },
    toggleHelpDialog: () => {
      dispatch(toggleHelpDialog());
    },
  };
};

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(9)} + 1px)`,
  },
});

const NavigationRail = styled(Drawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  ...(open && {
    ...openedMixin(theme),
    "& .MuiDrawer-paper": openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    "& .MuiDrawer-paper": closedMixin(theme),
  }),
}));

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
    <Root
      component="nav"
      className={classes.drawer}
      aria-label="navigation drawer"
    >
      {/* Temporary drawer on mobile screen */}
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
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth },
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

      {/* Permanent drawer on desktop screen */}
      <NavigationRail
        variant="permanent"
        open={props.onNavDrawer}
        sx={{
          display: { xs: "none", md: "block" },
        }}
      >
        <Toolbar />
        {drawer}
      </NavigationRail>
    </Root>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(NavigationDrawer);
