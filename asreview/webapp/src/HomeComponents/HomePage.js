import * as React from "react";
import { connect } from "react-redux";
import clsx from "clsx";

import { Box, Fade } from "@mui/material";
import { styled } from "@mui/material/styles";

import { NavigationDrawer } from "../Components";
import { DashboardPage } from "../HomeComponents/DashboardComponents";

import { drawerWidth } from "../globals.js";

const PREFIX = "HomePage";

const classes = {
  content: `${PREFIX}-content`,
  contentShift: `${PREFIX}-contentShift`,
  container: `${PREFIX}-container`,
};

const Root = styled("div")(({ theme }) => ({
  [`& .${classes.content}`]: {
    flexGrow: 1,
    padding: 0,
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    overflowY: "scroll",
    height: `calc(100vh - 56px)`,
    // WebkitOverflowScrolling: "touch",
    [`${theme.breakpoints.up("xs")} and (orientation: landscape)`]: {
      height: `calc(100vh - 48px)`,
    },
    [theme.breakpoints.up("sm")]: {
      height: `calc(100vh - 64px)`,
    },
    [theme.breakpoints.up("md")]: {
      marginLeft: 72,
    },
  },

  [`& .${classes.contentShift}`]: {
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: drawerWidth,
  },

  [`& .${classes.container}`]: {
    height: "100%",
  },
}));

const mapStateToProps = (state) => {
  return {
    app_state: state.app_state,
    nav_state: state.nav_state,
  };
};

const HomePage = (props) => {
  return (
    <Root aria-label="home page">
      <NavigationDrawer
        handleAppState={props.handleAppState}
        handleNavState={props.handleNavState}
        mobileScreen={props.mobileScreen}
        onNavDrawer={props.onNavDrawer}
        toggleNavDrawer={props.toggleNavDrawer}
        toggleSettings={props.toggleSettings}
      />
      <Box
        component="main"
        className={clsx(classes.content, {
          [classes.contentShift]: !props.mobileScreen && props.onNavDrawer,
        })}
        aria-label="home page content"
      >
        <Fade in={props.app_state === "home"}>
          <Box
            className={classes.container}
            aria-label="home page content transition"
          >
            <DashboardPage
              handleAppState={props.handleAppState}
              handleNavState={props.handleNavState}
              mobileScreen={props.mobileScreen}
              onNavDrawer={props.onNavDrawer}
              toggleNavDrawer={props.toggleNavDrawer}
              toggleSettings={props.toggleSettings}
            />
          </Box>
        </Fade>
      </Box>
    </Root>
  );
};

export default connect(mapStateToProps)(HomePage);
