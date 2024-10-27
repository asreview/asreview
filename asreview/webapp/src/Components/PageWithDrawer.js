import {
  DisplaySettingsOutlined,
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
import { CommunityDialog, Header, SettingsDialog } from "Components";
import { Link, Outlet } from "react-router-dom";

import { useToggle } from "hooks/useToggle";
import { WordMark } from "icons/WordMark";
import { DrawerItem } from "StyledComponents/StyledDrawerItem";

import { StyledList } from "StyledComponents/StyledList";

import { ReviewSettingsProvider } from "context/ReviewSettingsContext";

const BottomNavigationDrawerItems = ({
  mobileScreen,
  toggleNavDrawer,
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
          key={"display"}
          primary={"Display"}
          rail={rail}
          icon={<DisplaySettingsOutlined />}
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
          key={"community"}
          primary={"Community"}
          rail={rail}
          icon={<Diversity1Outlined />}
          onClick={() => {
            if (mobileScreen) {
              toggleNavDrawer();
            }
            toggleHelp();
          }}
        />
        <CommunityDialog
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
    <ReviewSettingsProvider>
      <Box
        component="nav"
        aria-label="navigation drawer"
        sx={{ width: { sm: "250px" }, flexShrink: { sm: 0 } }}
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
              width: "250px",
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
            mobileScreen={mobileScreen}
            toggleNavDrawer={toggleMobileDrawer}
            rail={false}
          />
        </Drawer>

        {/* Permanent drawer on desktop screen */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", md: "block" },
            width: "80px",
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: "80px",
              // boxSizing: "border-box",
            },
          }}
        >
          <StyledList>
            <Box
              component={navComponent}
              {...navComponentProps}
              onClick={mobileDrawer ? toggleNavDrawer : undefined}
              rail={true}
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
              rail={true}
            />
          </StyledList>
        </Drawer>
      </Box>
      <Box
        aria-label="home page"
        sx={(theme) => ({
          marginLeft: "80px",
          marginTop: "64px",
          [theme.breakpoints.down("md")]: {
            marginLeft: "0px",
          },
        })}
      >
        <Header
          toggleNavDrawer={mobileScreen ? toggleMobileDrawer : toggleNavDrawer}
          menuOpenButton={mobileScreen}
        />
        <Outlet />
      </Box>
    </ReviewSettingsProvider>
  );
};

export default PageWithDrawer;
