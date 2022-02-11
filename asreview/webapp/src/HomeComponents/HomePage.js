import * as React from "react";
import clsx from "clsx";

import { Box } from "@mui/material";
import { styled } from "@mui/material/styles";

import { DashboardPage } from "../HomeComponents/DashboardComponents";

import { drawerWidth } from "../globals.js";

const PREFIX = "HomePage";

const classes = {
  content: `${PREFIX}-content`,
  contentShift: `${PREFIX}-contentShift`,
};

const Root = styled("div")(({ theme }) => ({
  [`& .${classes.content}`]: {
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
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
}));

const HomePage = (props) => {
  return (
    <Root aria-label="home page">
      <Box
        component="main"
        className={clsx("main-page-content", classes.content, {
          [classes.contentShift]: !props.mobileScreen && props.onNavDrawer,
        })}
        aria-label="home page content"
      >
        {/* Dashboard */}
        <DashboardPage
          mobileScreen={props.mobileScreen}
          onNavDrawer={props.onNavDrawer}
        />
      </Box>
    </Root>
  );
};

export default HomePage;
