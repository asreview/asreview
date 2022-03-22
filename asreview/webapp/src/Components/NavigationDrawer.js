import React from "react";
import { connect } from "react-redux";
import { useNavigate, Outlet } from "react-router-dom";
import {
  Box,
  ButtonBase,
  CardMedia,
  Drawer,
  IconButton,
  Toolbar,
} from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";
import { Menu } from "@mui/icons-material";

import { DrawerItemContainer, Header } from "../Components";

import ASReviewLAB_black from "../images/asreview_sub_logo_lab_black_transparent.svg";
import ASReviewLAB_white from "../images/asreview_sub_logo_lab_white_transparent.svg";
import { drawerWidth } from "../globals.js";
import { toggleHelpDialog } from "../redux/actions";

const Root = styled("div")(({ theme }) => ({}));

const mapDispatchToProps = (dispatch) => {
  return {
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
  const navigate = useNavigate();
  const theme = useTheme();

  const wordmarkState = () => {
    if (theme.palette.mode === "dark") {
      return ASReviewLAB_white;
    } else {
      return ASReviewLAB_black;
    }
  };

  const container =
    window !== undefined ? () => window().document.body : undefined;

  return (
    <Root>
      <Header toggleNavDrawer={props.toggleNavDrawer} />
      <Box
        component="nav"
        aria-label="navigation drawer"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        {/* Temporary drawer on mobile screen */}
        <Drawer
          container={container}
          variant="temporary"
          open={props.mobileScreen && props.onNavDrawer}
          onClose={props.toggleNavDrawer}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
        >
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={props.toggleNavDrawer}
              size="large"
              sx={{ marginRight: "4px" }}
            >
              <Menu />
            </IconButton>
            <ButtonBase disableRipple>
              <CardMedia
                component="img"
                src={wordmarkState()}
                alt="ASReview LAB Dashboard"
                onClick={() => {
                  props.toggleNavDrawer();
                  navigate("/");
                }}
                sx={{ width: 130 }}
              />
            </ButtonBase>
          </Toolbar>
          <DrawerItemContainer
            mobileScreen={props.mobileScreen}
            onNavDrawer={props.onNavDrawer}
            toggleNavDrawer={props.toggleNavDrawer}
            toggleSettings={props.toggleSettings}
            toggleHelpDialog={props.toggleHelpDialog}
          />
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
          <DrawerItemContainer
            mobileScreen={props.mobileScreen}
            onNavDrawer={props.onNavDrawer}
            toggleNavDrawer={props.toggleNavDrawer}
            toggleSettings={props.toggleSettings}
            toggleHelpDialog={props.toggleHelpDialog}
          />
        </NavigationRail>
      </Box>
      <Outlet />
    </Root>
  );
};

export default connect(null, mapDispatchToProps)(NavigationDrawer);
