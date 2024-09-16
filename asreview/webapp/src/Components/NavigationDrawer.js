import React from "react";

import { Outlet, Link } from "react-router-dom";
import { Box, ButtonBase, Drawer, IconButton, Toolbar } from "@mui/material";
import { styled } from "@mui/material/styles";
import { Menu } from "@mui/icons-material";

import { DrawerItemContainer, Header } from "Components";

import { WordMark } from "icons/WordMark";
import { drawerWidth } from "globals.js";
import { useToggle } from "hooks/useToggle";

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
})(({ theme }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  variants: [
    {
      props: ({ open }) => open,
      style: {
        ...openedMixin(theme),
        "& .MuiDrawer-paper": openedMixin(theme),
      },
    },
    {
      props: ({ open }) => !open,
      style: {
        ...closedMixin(theme),
        "& .MuiDrawer-paper": closedMixin(theme),
      },
    },
  ],
}));

const NavigationDrawer = ({
  window,
  toggleNavDrawer,
  onNavDrawer,
  mobileScreen,
  toggleSettings,
  toggleHelp,
}) => {
  const container =
    window !== undefined ? () => window().document.body : undefined;

  const [openMobileDrawer, toggleMobileDrawer] = useToggle();

  return (
    <Box>
      <Header
        toggleNavDrawer={mobileScreen ? toggleMobileDrawer : toggleNavDrawer}
      />
      <Box
        component="nav"
        aria-label="navigation drawer"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        {/* Temporary drawer on mobile screen */}
        <Drawer
          container={container}
          variant="temporary"
          open={openMobileDrawer}
          onClose={toggleMobileDrawer}
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
              onClick={toggleMobileDrawer}
              size="large"
              sx={{ marginRight: "4px" }}
            >
              <Menu />
            </IconButton>
            <ButtonBase
              disableRipple
              sx={{ width: "100px" }}
              component={Link}
              to="/reviews"
            >
              <WordMark />
            </ButtonBase>
          </Toolbar>
          <DrawerItemContainer
            mobileScreen={mobileScreen}
            onNavDrawer={openMobileDrawer}
            toggleNavDrawer={toggleMobileDrawer}
            toggleSettings={toggleSettings}
            toggleHelp={toggleHelp}
          />
        </Drawer>

        {/* Permanent drawer on desktop screen */}
        <NavigationRail
          variant="permanent"
          open={onNavDrawer}
          sx={{
            display: { xs: "none", md: "block" },
          }}
        >
          <Toolbar />
          <DrawerItemContainer
            mobileScreen={mobileScreen}
            onNavDrawer={onNavDrawer}
            toggleNavDrawer={toggleNavDrawer}
            toggleSettings={toggleSettings}
            toggleHelp={toggleHelp}
          />
        </NavigationRail>
      </Box>
      <Outlet />
    </Box>
  );
};

export default NavigationDrawer;
