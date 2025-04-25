import {
  SettingsOutlined,
  Diversity1Outlined,
  Menu,
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
import {
  CommunityDialog,
  Header,
  SettingsDialog,
  ErrorBoundary,
} from "Components";
import { Link, Outlet } from "react-router-dom";

import { useToggle } from "hooks/useToggle";
import { WordMark } from "icons/WordMark";
import { DrawerItem } from "StyledComponents/StyledDrawerItem";

import { StyledList } from "StyledComponents/StyledList";

import { ReviewSettingsProvider } from "context/ReviewSettingsContext";

const BottomNavigationDrawerItems = ({
  toggleNavDrawer = null,
  rail = false,
}) => {
  const [onHelp, toggleHelp] = useToggle();
  const [onSettings, toggleSettings] = useToggle();

  return (
    <>
      <Divider sx={{ mx: 1 }} />

      {/* Bottom Section */}
      <Box>
        <DrawerItem
          key={"settings"}
          primary={"Settings"}
          rail={rail}
          icon={<SettingsOutlined />}
          onClick={() => {
            if (toggleNavDrawer) {
              toggleNavDrawer();
            }
            toggleSettings();
          }}
        />
        <SettingsDialog
          onSettings={onSettings}
          toggleSettings={toggleSettings}
        />
        <DrawerItem
          key={"community"}
          primary={"Community"}
          rail={rail}
          icon={<Diversity1Outlined />}
          onClick={() => {
            if (toggleNavDrawer) {
              toggleNavDrawer();
            }
            toggleHelp();
          }}
        />
        <CommunityDialog onHelp={onHelp} toggleHelp={toggleHelp} />
      </Box>
    </>
  );
};

const PageWithDrawer = ({ navComponent, navComponentProps }) => {
  const mobileScreen = useMediaQuery((theme) => theme.breakpoints.down("md"), {
    noSsr: true,
  });

  const [mobileDrawer, toggleMobileDrawer] = useToggle();

  return (
    <ReviewSettingsProvider>
      <Box
        component="nav"
        aria-label="navigation drawer"
        sx={{ width: { sm: "250px" }, flexShrink: { sm: 0 } }}
      >
        {/* Temporary drawer on mobile screen */}
        <Drawer
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
              width: "250px",
              borderRadius: 0,
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
              component={Link}
              to="/reviews"
              sx={{
                height: "32px",
                display: "flex",
                alignItems: "center",
              }}
            >
              <WordMark />
            </ButtonBase>
          </Toolbar>
          <Box
            component={navComponent}
            {...navComponentProps}
            onClick={toggleMobileDrawer}
            rail={false}
          />
          <Box
            sx={{
              overflowX: "hidden",
              overflowY: "auto",
              flex: "1 1 auto",
            }}
          />
          <BottomNavigationDrawerItems
            toggleNavDrawer={toggleMobileDrawer}
            rail={false}
          />
        </Drawer>

        {/* Permanent drawer on desktop screen */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", md: "block" },
            width: "88px",
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: "88px",
              // boxSizing: "border-box",
              borderRight: "0px",
              borderRadius: 0,
            },
          }}
        >
          <StyledList>
            <Box component={navComponent} {...navComponentProps} rail={true} />
            <Box
              sx={{
                overflowX: "hidden",
                overflowY: "auto",
                flex: "1 1 auto",
              }}
            />
            <BottomNavigationDrawerItems rail={true} />
          </StyledList>
        </Drawer>
      </Box>
      <Box
        aria-label="home page"
        sx={(theme) => ({
          marginLeft: "88px",
          marginTop: mobileScreen ? 3 : 8,
          [theme.breakpoints.down("md")]: {
            marginLeft: "0px",
          },
        })}
      >
        <Header
          toggleNavDrawer={toggleMobileDrawer}
          menuOpenButton={mobileScreen}
        />
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </Box>
    </ReviewSettingsProvider>
  );
};

export default PageWithDrawer;
