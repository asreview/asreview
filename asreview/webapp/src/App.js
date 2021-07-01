import React from "react";
import { CssBaseline, createMuiTheme } from "@material-ui/core";
import { ThemeProvider } from "@material-ui/core/styles";
import "./App.css";

import { Header, ReviewZone, ExportDialog, HistoryDialog } from "./Components";
import { PreReviewZone, StartReview, ProjectPage } from "./PreReviewComponents";
import ReviewZoneComplete from "./PostReviewComponents/ReviewZoneComplete";
import Projects from "./Projects";
import SettingsDialog from "./SettingsDialog";
import UserSettingsDialog from "./UserSettingsDialog";
import ExitDialog from "./ExitDialog";
import WelcomeScreen from "./WelcomeScreen";
import {
  useDarkMode,
  useTextSize,
  useUndoEnabled,
  useKeyPressEnabled,
} from "./hooks/SettingsHooks";

import "typeface-roboto";

import { connect } from "react-redux";

// redux config
import { setAppState } from "./redux/actions";

// auth users
import { UsersAPI } from "./api/index.js";

const mapStateToProps = (state) => {
  return {
    app_state: state.app_state,
    project_id: state.project_id,
    // Test
    //users: [],
    accessToken: state.accessToken,
    //messageType: state.messageType,
    //messageText: state.messageText,
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

  const [theme, toggleDarkMode] = useDarkMode();
  const muiTheme = createMuiTheme(theme);

  const [openLogin, setLoginOpen] = React.useState(false);
  const [openUserSettings, setUserSettingsOpen] = React.useState(false);
  const [openSettings, setSettingsOpen] = React.useState(false);
  const [exit, setExit] = React.useState(false);
  const [exportResult, setExportResult] = React.useState(false);
  const [history, setHistory] = React.useState(false);
  const [authors, setAuthors] = React.useState(false);

  const [textSize, handleTextSizeChange] = useTextSize();
  const [undoEnabled, toggleUndoEnabled] = useUndoEnabled();
  const [keyPressEnabled, toggleKeyPressEnabled] = useKeyPressEnabled();

  const toggleAuthors = () => {
    setAuthors((a) => !a);
  };

  const handleClickOpen = () => {
    setSettingsOpen(true);
  };

  const handleClose = () => {
    setSettingsOpen(false);
  };

  // Users settings
  const handleUsersOpen = () => {
    setUserSettingsOpen(true);
  }

  const handleUsersClose = () => {
    setUserSettingsOpen(false);
  }

  // Login within settings
  const handleLoginOpen = () => {
    setLoginOpen(true);
  }

  const handleLoginClose = () => {
    setLoginOpen(false);
  }

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
          toggleExportResult={toggleExportResult}
          toggleHistory={toggleHistory}
          toggleDarkMode={toggleDarkMode}
          handleClickOpen={handleClickOpen}
          handleUsersOpen={handleUsersOpen}
          handleTextSizeChange={handleTextSizeChange}
          toggleExit={toggleExit}
          isAuthenticated={UsersAPI.isAuthenticated}
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
          showAuthors={authors}
          textSize={textSize}
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
      <UserSettingsDialog
        openUserSettings={openUserSettings}
        handleClose={handleUsersClose}
      />
      <SettingsDialog
        openSettings={openSettings}
        handleClose={handleClose}
        handleTextSizeChange={handleTextSizeChange}
        textSize={textSize}
        toggleDarkMode={toggleDarkMode}
        toggleAuthors={toggleAuthors}
        onDark={theme}
        showAuthors={authors}
        toggleUndoEnabled={toggleUndoEnabled}
        undoEnabled={undoEnabled}
        toggleKeyPressEnabled={toggleKeyPressEnabled}
        keyPressEnabled={keyPressEnabled}
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
