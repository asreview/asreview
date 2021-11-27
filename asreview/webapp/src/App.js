import React from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { connect } from "react-redux";
import "typeface-roboto";
import { CssBaseline, createTheme, useMediaQuery } from "@mui/material";
import { ThemeProvider, StyledEngineProvider } from "@mui/material/styles";
import "./App.css";

import { Header, HelpDialog, SettingsDialog } from "./Components";
import {
  PreReviewZone,
  StartReview,
} from "./PreReviewComponents";
import { HomePage } from "./HomeComponents";
import { ProjectPage } from "./ProjectComponents";
import { ReviewZoneComplete } from "./PostReviewComponents";
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
  const [settings, setSettings] = useToggle();

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
  const [navDrawer, setNavDrawer] = useToggle(mobileScreen ? false : true);

  return (
    <QueryClientProvider client={queryClient}>
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={muiTheme}>
          <CssBaseline />
          {props.app_state === "boot" && <WelcomeScreen />}
          {props.app_state !== "boot" && (
            <Header
              handleAppState={props.setAppState}
              toggleNavDrawer={setNavDrawer}
            />
          )}

          {props.app_state === "home" && (
            <HomePage
              handleAppState={props.setAppState}
              handleNavState={props.setNavState}
              mobileScreen={mobileScreen}
              onNavDrawer={navDrawer}
              toggleNavDrawer={setNavDrawer}
              toggleSettings={setSettings}
            />
          )}

          {props.app_state === "project-page" && (
            <ProjectPage
              handleAppState={props.setAppState}
              handleNavState={props.setNavState}
              mobileScreen={mobileScreen}
              onNavDrawer={navDrawer}
              toggleNavDrawer={setNavDrawer}
              toggleSettings={setSettings}
              fontSize={fontSize}
              undoEnabled={undoEnabled}
              keyPressEnabled={keyPressEnabled}
            />
          )}

          {props.app_state === "review-init" && <PreReviewZone />}

          {props.app_state === "train-first-model" && <StartReview />}

          {props.app_state === "review-complete" && (
            <ReviewZoneComplete handleAppState={props.setAppState} />
          )}

          {/* Dialogs */}
          <SettingsDialog
            mobileScreen={mobileScreen}
            onSettings={settings}
            onDark={theme}
            fontSize={fontSize}
            keyPressEnabled={keyPressEnabled}
            undoEnabled={undoEnabled}
            toggleSettings={setSettings}
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
