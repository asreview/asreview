import React from "react";
import axios from "axios";
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
  useTextSize,
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
  const [theme, toggleDarkMode] = useDarkMode();
  const muiTheme = createMuiTheme(theme);

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

  const toggleExit = () => {
    setExit((a) => !a);
  };

  const toggleExportResult = () => {
    setExportResult((a) => !a);
  };

  const toggleHistory = () => {
    setHistory((a) => !a);
  };

  // Auth

  const isAuthenticated = () => {
    if (this.state.accessToken || this.validRefresh()) {
      return true;
    }
    return false;
  };

  const logoutUser = () => {
    window.localStorage.removeItem("refreshToken");
    this.setState({ accessToken: null });
    this.createMessage("success", "You have logged out.");
  };

  const validRefresh = () => {
    const token = window.localStorage.getItem("refreshToken");
    if (token) {
      axios
        .post(`${process.env.REACT_APP_API_SERVICE_URL}/auth/refresh`, {
          refresh_token: token,
        })
        .then((res) => {
          this.setState({ accessToken: res.data.access_token });
          this.getUsers();
          window.localStorage.setItem("refreshToken", res.data.refresh_token);
          return true;
        })
        .catch((err) => {
          return false;
        });
    }
    return false;
  };

  const createMessage = (type, text) => {
    this.setState({
      messageType: type,
      messageText: text,
    });
    setTimeout(() => {
      this.removeMessage();
    }, 3000);
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
          handleTextSizeChange={handleTextSizeChange}
          toggleExit={toggleExit}
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
