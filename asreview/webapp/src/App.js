import React from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { connect } from "react-redux";
import "typeface-roboto";
import { CssBaseline, createTheme, useMediaQuery } from "@mui/material";
import { ThemeProvider, StyledEngineProvider } from "@mui/material/styles";
import "./App.css";

import {
  Header,
  HelpDialog,
  NavigationDrawer,
  SettingsDialog,
} from "./Components";
import { HomePage } from "./HomeComponents";
import { ProjectPage } from "./ProjectComponents";
import WelcomeScreen from "./WelcomeScreen";
import {
  useDarkMode,
  useFontSize,
  useKeyPressEnabled,
  useUndoEnabled,
} from "./hooks/SettingsHooks";
import { useToggle } from "./hooks/useToggle";

// redux config
import { setAppState, setNavState } from "./redux/actions";

const mapStateToProps = (state) => {
  return {
    app_state: state.app_state,
  };
};

function mapDispatchToProps(dispatch) {
  return {
    setAppState: (app_state) => {
      dispatch(setAppState(app_state));
    },
    setNavState: (nav_state) => {
      dispatch(setNavState(nav_state));
    },
  };
}

const queryClient = new QueryClient();

const App = (props) => {
  // Dialog state
  const [onSettings, toggleSettings] = useToggle();

  // Settings hook
  const [theme, toggleDarkMode] = useDarkMode();
  const [fontSize, handleFontSizeChange] = useFontSize();
  const [undoEnabled, toggleUndoEnabled] = useUndoEnabled();
  const [keyPressEnabled, toggleKeyPressEnabled] = useKeyPressEnabled();

  const muiTheme = createTheme(theme);
  const mobileScreen = useMediaQuery(muiTheme.breakpoints.down("md"), {
    noSsr: true,
  });

  // Navigation drawer state
  const [onNavDrawer, toggleNavDrawer] = useToggle(mobileScreen ? false : true);

  return (
    <QueryClientProvider client={queryClient}>
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={muiTheme}>
          <CssBaseline />
          {props.app_state === "boot" && <WelcomeScreen />}
          {props.app_state !== "boot" && (
            <Header
              handleAppState={props.setAppState}
              toggleNavDrawer={toggleNavDrawer}
            />
          )}
          <div aria-label="nav and main content">
            <NavigationDrawer
              handleAppState={props.setAppState}
              handleNavState={props.setNavState}
              mobileScreen={mobileScreen}
              onNavDrawer={onNavDrawer}
              toggleNavDrawer={toggleNavDrawer}
              toggleSettings={toggleSettings}
            />
            {props.app_state === "home" && (
              <HomePage
                handleAppState={props.setAppState}
                handleNavState={props.setNavState}
                mobileScreen={mobileScreen}
                onNavDrawer={onNavDrawer}
              />
            )}
            {props.app_state === "project-page" && (
              <ProjectPage
                handleAppState={props.setAppState}
                handleNavState={props.setNavState}
                mobileScreen={mobileScreen}
                onNavDrawer={onNavDrawer}
                fontSize={fontSize}
                undoEnabled={undoEnabled}
                keyPressEnabled={keyPressEnabled}
              />
            )}
          </div>

          {/* Dialogs */}
          <SettingsDialog
            mobileScreen={mobileScreen}
            onSettings={onSettings}
            onDark={theme}
            fontSize={fontSize}
            keyPressEnabled={keyPressEnabled}
            undoEnabled={undoEnabled}
            toggleSettings={toggleSettings}
            toggleDarkMode={toggleDarkMode}
            handleFontSizeChange={handleFontSizeChange}
            toggleKeyPressEnabled={toggleKeyPressEnabled}
            toggleUndoEnabled={toggleUndoEnabled}
          />
          <HelpDialog mobileScreen={mobileScreen} />
        </ThemeProvider>
      </StyledEngineProvider>
    </QueryClientProvider>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
