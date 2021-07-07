import React from "react";
import { CssBaseline, createMuiTheme } from "@material-ui/core";
import { ThemeProvider } from "@material-ui/core/styles";
import "./App.css";

import { Header, ReviewZone, ExportDialog, HistoryDialog } from "./Components";
import { PreReviewZone, StartReview, ProjectPage } from "./PreReviewComponents";
import ReviewZoneComplete from "./PostReviewComponents/ReviewZoneComplete";
import Projects from "./Projects";
import SettingsDialog from "./SettingsDialog";
import ExitDialog from "./ExitDialog";
import WelcomeScreen from "./WelcomeScreen";
import {
  useDarkMode,
  useFontSize,
  useUndoEnabled,
  useKeyPressEnabled,
} from "./hooks/SettingsHooks";

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

const App = (props) => {

  // Dialog state
  const [settings, setSettings] = React.useState(false);
  const [exit, setExit] = React.useState(false);
  const [exportResult, setExportResult] = React.useState(false);
  const [history, setHistory] = React.useState(false);

  // Settings hook
  const [theme, toggleDarkMode] = useDarkMode();
  const [fontSize, handleFontSizeChange] = useFontSize();
  const [undoEnabled, toggleUndoEnabled] = useUndoEnabled();
  const [keyPressEnabled, toggleKeyPressEnabled] = useKeyPressEnabled();

  const muiTheme = createMuiTheme(theme);

  // Dialog toggle
  const toggleSettings = () => {
    setSettings((a) => !a);
  };

  const toggleExit = () => {
    setExit((a) => !a);
  };

  const toggleExportResult = () => {
    setExportResult((a) => !a);
  };

  const toggleHistory = () => {
    setHistory((a) => !a);
  };

  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      {props.app_state === "boot" && <WelcomeScreen />}
      {props.app_state !== "boot" && (
        <Header
          /* Handle the app review drawer */
          toggleSettings={toggleSettings}
          toggleExit={toggleExit}
          toggleExportResult={toggleExportResult}
          toggleHistory={toggleHistory}
        />
      )}

      {props.app_state === "projects" && (
        <Projects handleAppState={props.setAppState} />
      )}

      {props.app_state === "project-page" && (
        <ProjectPage
          handleAppState={props.setAppState}
          toggleExportResult={toggleExportResult}
        />
      )}

      {props.app_state === "review-init" && (
        <PreReviewZone handleAppState={props.setAppState} />
      )}

      {props.app_state === "train-first-model" && (
        <StartReview handleAppState={props.setAppState} />
      )}

      {props.app_state === "review" && (
        <ReviewZone
          handleAppState={props.setAppState}
          fontSize={fontSize}
          undoEnabled={undoEnabled}
          keyPressEnabled={keyPressEnabled}
        />
      )}

      {props.app_state === "review-complete" && (
        <ReviewZoneComplete
          handleAppState={props.setAppState}
          toggleExportResult={toggleExportResult}
        />
      )}

      {/* Dialogs */}
      <SettingsDialog
        onSettings={settings}
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
      <ExitDialog toggleExit={toggleExit} exit={exit} />
      <ExportDialog
        toggleExportResult={toggleExportResult}
        exportResult={exportResult}
      />
      {props.app_state === "review" && (
        <HistoryDialog toggleHistory={toggleHistory} history={history} />
      )}
    </ThemeProvider>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
