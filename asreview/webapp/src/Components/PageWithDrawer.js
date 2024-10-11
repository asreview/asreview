import {
  Diversity1Outlined,
  HelpOutlineOutlined,
  Menu,
  TuneOutlined,
} from "@mui/icons-material";
import {
  Box,
  ButtonBase,
  Divider,
  Drawer,
  IconButton,
  Toolbar,
  useMediaQuery,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import clsx from "clsx";
import {
  Header,
  HelpDialog,
  OpenInNewIconStyled,
  SettingsDialog,
} from "Components";
import { communityURL } from "globals.js";
import React from "react";
import { Link, Outlet } from "react-router-dom";

import { drawerWidth } from "globals.js";
import { useToggle } from "hooks/useToggle";
import { WordMark } from "icons/WordMark";
import { DrawerItem } from "StyledComponents/StyledDrawerItem";

import { StyledList } from "StyledComponents/StyledList";
import { StyledNavigationRail } from "StyledComponents/StyledNavigationRail";

const classes = {
  content: `HomePage-content`,
  contentShift: `HomePage-contentShift`,
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

const BottomNavigationDrawerItems = ({
  mobileScreen,
  toggleNavDrawer,
  showTooltip = false,
}) => {
  const [onHelp, toggleHelp] = useToggle();
  const [onSettings, toggleSettings] = useToggle();

  return (
    <>
      <Divider />

      {/* Bottom Section */}
      <Box>
        {communityURL && (
          <DrawerItem
            key={"community"}
            toolTipTitle={"Community"}
            primary={
              <React.Fragment>
                Community <OpenInNewIconStyled />
              </React.Fragment>
            }
            showTooltip={showTooltip}
            icon={<Diversity1Outlined />}
            component={"a"}
            href={communityURL}
            target="_blank"
            onClick={() => {
              if (mobileScreen) {
                toggleNavDrawer();
              }
            }}
          />
        )}

        <DrawerItem
          key={"customize"}
          primary={"Customize"}
          showTooltip={showTooltip}
          icon={<TuneOutlined />}
          onClick={() => {
            if (mobileScreen) {
              toggleNavDrawer();
            }
            toggleSettings();
          }}
        />
        <SettingsDialog
          mobileScreen={mobileScreen}
          onSettings={onSettings}
          toggleSettings={toggleSettings}
        />
        <DrawerItem
          key={"help"}
          primary={"Help"}
          showTooltip={showTooltip}
          icon={<HelpOutlineOutlined />}
          onClick={() => {
            if (mobileScreen) {
              toggleNavDrawer();
            }
            toggleHelp();
          }}
        />
        <HelpDialog
          mobileScreen={mobileScreen}
          onHelp={onHelp}
          toggleHelp={toggleHelp}
        />
      </Box>
    </>
  );
};

const PageWithDrawer = ({ window, navComponent, navComponentProps }) => {
  const container =
    window !== undefined ? () => window().document.body : undefined;

  const mobileScreen = useMediaQuery((theme) => theme.breakpoints.down("md"), {
    noSsr: true,
  });

  const [onNavDrawer, toggleNavDrawer] = useToggle(!mobileScreen);
  const [mobileDrawer, toggleMobileDrawer] = useToggle();

  return (
    <Box>
      <Header
        onNavDrawer={onNavDrawer}
        toggleNavDrawer={mobileScreen ? toggleMobileDrawer : toggleNavDrawer}
        menuOpenButton={!mobileScreen}
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
          open={mobileDrawer}
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
              sx={{ mr: 1 }}
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
          <Box
            component={navComponent}
            {...navComponentProps}
            projectInfo={true}
            onClick={mobileDrawer ? toggleNavDrawer : undefined}
            showTooltip={onNavDrawer}
          />
          <Box
            sx={{
              overflowX: "hidden",
              overflowY: "auto",
              flex: "1 1 auto",
            }}
          />
          <BottomNavigationDrawerItems
            mobileScreen={mobileScreen}
            toggleNavDrawer={toggleMobileDrawer}
            showTooltip={onNavDrawer}
          />
        </Drawer>

        {/* Permanent drawer on desktop screen */}
        <StyledNavigationRail
          variant="permanent"
          open={onNavDrawer}
          sx={{
            display: { xs: "none", md: "block" },
          }}
        >
          <Toolbar />

          <StyledList>
            <Box
              component={navComponent}
              {...navComponentProps}
              projectInfo={onNavDrawer}
              onClick={mobileDrawer ? toggleNavDrawer : undefined}
              showTooltip={onNavDrawer}
            />
            <Box
              sx={{
                overflowX: "hidden",
                overflowY: "auto",
                flex: "1 1 auto",
              }}
            />
            <BottomNavigationDrawerItems
              mobileScreen={mobileScreen}
              toggleNavDrawer={toggleMobileDrawer}
              showTooltip={onNavDrawer}
            />
          </StyledList>
        </StyledNavigationRail>
      </Box>
      <Root aria-label="home page">
        <Box
          component="main"
          className={clsx("main-page-content", classes.content, {
            [classes.contentShift]: !mobileScreen && onNavDrawer,
          })}
          aria-label="home page content"
        >
          <Outlet />
        </Box>
      </Root>
    </Box>
  );
};

export default PageWithDrawer;
