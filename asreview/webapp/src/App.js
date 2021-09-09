import React from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { CssBaseline, createMuiTheme, useMediaQuery } from "@material-ui/core";
import { ThemeProvider } from "@material-ui/core/styles";
import "./App.css";

import { Header, HistoryDialog, ExportDialog } from "./Components";
import { PreReviewZone, StartReview, ProjectPage } from "./PreReviewComponents";
import { ReviewDialog } from "./InReviewComponents";
import { ReviewZoneComplete } from "./PostReviewComponents";
import Projects from "./Projects";
import SettingsDialog from "./SettingsDialog";
import HelpDialog from "./HelpDialog";
import ExitDialog from "./ExitDialog";
import WelcomeScreen from "./WelcomeScreen";
import {
  useDarkMode,
  useFontSize,
  useKeyPressEnabled,
  useUndoEnabled,
} from "./hooks/SettingsHooks";
import { useToggle } from "./hooks/useToggle";

import "typeface-roboto";

import { connect } from "react-redux";

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
  const [exit, setExit] = useToggle();
  const [exportResult, setExportResult] = useToggle();
  const [history, setHistory] = useToggle();
  const [review, setReview] = useToggle();

  // Settings hook
  const [theme, toggleDarkMode] = useDarkMode();
  const [fontSize, handleFontSizeChange] = useFontSize();
  const [undoEnabled, toggleUndoEnabled] = useUndoEnabled();
  const [keyPressEnabled, toggleKeyPressEnabled] = useKeyPressEnabled();

  const muiTheme = createMuiTheme(theme);
  const mobileScreen = useMediaQuery(muiTheme.breakpoints.down("sm"));

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={muiTheme}>
        <CssBaseline />
        {props.app_state === "boot" && <WelcomeScreen />}
        {props.app_state !== "boot" && (
          <Header
            /* Handle the app review drawer */
            toggleSettings={setSettings}
            toggleExit={setExit}
          />
        )}

        {props.app_state === "projects" && (
          <Projects handleAppState={props.setAppState} />
        )}

        {props.app_state === "project-page" && (
          <ProjectPage
            handleAppState={props.setAppState}
            toggleReview={setReview}
            toggleExportResult={setExportResult}
          />
        )}

        {props.app_state === "review-init" && (
          <PreReviewZone handleAppState={props.setAppState} />
        )}

        {props.app_state === "train-first-model" && (
          <StartReview handleAppState={props.setAppState} />
        )}

        {props.app_state === "review" && (
          <ReviewDialog
            handleAppState={props.setAppState}
            mobileScreen={mobileScreen}
            onReview={review}
            toggleReview={setReview}
            toggleHistory={setHistory}
            fontSize={fontSize}
            undoEnabled={undoEnabled}
            keyPressEnabled={keyPressEnabled}
          />
        )}
        {props.app_state === "review" && (
          <HistoryDialog
            mobileScreen={mobileScreen}
            toggleHistory={setHistory}
            history={history}
          />
        )}

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
        <ExitDialog toggleExit={setExit} exit={exit} />
        <ExportDialog
          toggleExportResult={setExportResult}
          exportResult={exportResult}
        />
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
