import React from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { connect } from "react-redux";
import "typeface-roboto";
import {
  CssBaseline,
  createTheme,
  useMediaQuery,
  adaptV4Theme,
} from "@mui/material";
import { ThemeProvider, StyledEngineProvider } from "@mui/material/styles";
import "./App.css";

import { Header, ExportDialog } from "./Components";
import {
  PreReviewZone,
  ProjectPageOLD,
  StartReview,
} from "./PreReviewComponents";
import { ProjectPage } from "./ProjectComponents";
import { ReviewZoneComplete } from "./PostReviewComponents";
import Projects from "./Projects";
import SettingsDialog from "./SettingsDialog";
import HelpDialog from "./HelpDialog";
import WelcomeScreen from "./WelcomeScreen";
import {
  useDarkMode,
  useFontSize,
  useKeyPressEnabled,
  useUndoEnabled,
} from "./hooks/SettingsHooks";
import { useToggle } from "./hooks/useToggle";

// redux config
import { setAppState } from "./redux/actions";

const mapStateToProps = (state) => {
  return {
    app_state: state.app_state,
    project_id: state.project_id,
  };
};

function mapDispatchToProps(dispatch) {
  return {
    setAppState: (app_state) => {
      dispatch(setAppState(app_state));
    },
  };
}

const queryClient = new QueryClient();

const App = (props) => {
  // Dialog state
  const [settings, setSettings] = useToggle();
  const [exportResult, setExportResult] = useToggle();

  // Settings hook
  const [theme, toggleDarkMode] = useDarkMode();
  const [fontSize, handleFontSizeChange] = useFontSize();
  const [undoEnabled, toggleUndoEnabled] = useUndoEnabled();
  const [keyPressEnabled, toggleKeyPressEnabled] = useKeyPressEnabled();

  const muiTheme = createTheme(adaptV4Theme(theme));
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

          {props.app_state === "dashboard" && (
            <Projects
              handleAppState={props.setAppState}
              mobileScreen={mobileScreen}
              onNavDrawer={navDrawer}
              toggleNavDrawer={setNavDrawer}
              toggleSettings={setSettings}
            />
          )}

          {props.app_state === "project-page" && (
            <ProjectPage
              handleAppState={props.setAppState}
              mobileScreen={mobileScreen}
              onNavDrawer={navDrawer}
              toggleNavDrawer={setNavDrawer}
              toggleSettings={setSettings}
              toggleExportResult={setExportResult}
              fontSize={fontSize}
              undoEnabled={undoEnabled}
              keyPressEnabled={keyPressEnabled}
            />
          )}

          {props.app_state === "project-page-old" && (
            <ProjectPageOLD
              handleAppState={props.setAppState}
              toggleExportResult={setExportResult}
            />
          )}

          {props.app_state === "review-init" && <PreReviewZone />}

          {props.app_state === "train-first-model" && <StartReview />}

          {props.app_state === "review-complete" && (
            <ReviewZoneComplete
              handleAppState={props.setAppState}
              toggleExportResult={setExportResult}
            />
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
          <ExportDialog
            toggleExportResult={setExportResult}
            exportResult={exportResult}
          />
        </ThemeProvider>
      </StyledEngineProvider>
    </QueryClientProvider>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
