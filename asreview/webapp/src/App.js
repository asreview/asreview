import React from 'react'
import {
  CssBaseline,
  createMuiTheme
} from '@material-ui/core'
import { ThemeProvider } from '@material-ui/core/styles';
import './App.css';

import {
  Header,
  ReviewZone,
  HistoryDialog,
  ExportDialog,
  ImportDialog,
}
from './Components'
import {
  PreReviewZone,
  StartReview,
  ProjectPage,
} from './PreReviewComponents'
import ReviewZoneComplete from './PostReviewComponents/ReviewZoneComplete'
import Projects from './Projects'
import SettingsDialog from './SettingsDialog'
import ExitDialog from './ExitDialog'
import WelcomeScreen from './WelcomeScreen'
import {
  useDarkMode,
  useTextSize,
  useUndoEnabled,
} from './SettingsHooks'

import 'typeface-roboto'

import { connect } from "react-redux";

// redux config
import store from './redux/store'
import { setAppState } from './redux/actions'


const mapStateToProps = state => {
  return {
    app_state: state.app_state,
    project_id: state.project_id,
  };
};


function mapDispatchToProps(dispatch) {
    return({
        setAppState: (app_state) => {dispatch(setAppState(app_state))}
    })
}


const App = (props) => {

  const [theme, toggleDarkMode] = useDarkMode()
  const muiTheme = createMuiTheme(theme)

  const [appState, setAppState] = React.useState({
    'step': 'boot',
    'reviewDrawerOpen': false,
  });
  const [openSettings, setSettingsOpen] = React.useState(false);
  const [exit, setExit] = React.useState(false);
  const [exportResult, setExportResult] = React.useState(false);
  const [openHistory, setHistoryOpen] = React.useState(false);
  const [authors, setAuthors] = React.useState(false);
  const [importProject, setImportProject] = React.useState(false);
  const [textSize, handleTextSizeChange] = useTextSize();
  const [undoEnabled, toggleUndoEnabled] = useUndoEnabled();

  const handleAppState = (step) => {

    if (step === 'review'){
      setAppState({
        'step': 'review',
        'reviewDrawerOpen': true,
      })
    } else {
      setAppState({
        'step': step,
        'reviewDrawerOpen': false,
      })
    }
  }

  const toggleAuthors = () => {
    setAuthors(a => (!a));
  };

  const handleClickOpen = () => {
    setSettingsOpen(true);
  };

  const handleClose = () => {
    setSettingsOpen(false);
  };

  const handleHistoryOpen = () => {
    setHistoryOpen(true);
  };

  const handleHistoryClose = () => {
    setHistoryOpen(false);
  };

  const toggleExit = () => {
    setExit(a => (!a));
  };

  const toggleExportResult = () => {
    setExportResult(a => (!a));
  };

  const toggleImportProject = () => {
    setImportProject(a => (!a));
  };

  const handleReviewDrawer = (show) => {
    setAppState({
      'step': props.app_state,
      'reviewDrawerOpen': show,
    })
  }

  console.log("Current step: " + props.app_state)

  return (
      <ThemeProvider theme={muiTheme}>
      <CssBaseline/>
      {props.app_state === 'boot' &&
      <WelcomeScreen/>
      }
      {props.app_state !== 'boot' &&
      <Header

        /* Handle the app review drawer */
        reviewDrawerState={appState['reviewDrawerOpen']}
        handleReviewDrawer={handleReviewDrawer}

        toggleDarkMode={toggleDarkMode}
        handleClickOpen={handleClickOpen}
        handleHistoryOpen={handleHistoryOpen}
        handleTextSizeChange={handleTextSizeChange}
        toggleExit={toggleExit}
        toggleExportResult={toggleExportResult}
        toggleImportProject={toggleImportProject}
      />
      }

      {props.app_state === 'projects' &&
      <Projects
        handleAppState={props.setAppState}
        toggleImportProject={toggleImportProject}
      />
      }

      {props.app_state === 'project-page' &&
      <ProjectPage
        project_id={props.project_id}
        handleAppState={props.setAppState}
      />
      }

      {props.app_state === 'review-init' &&
      <PreReviewZone
        handleAppState={props.setAppState}
      />
      }

      {props.app_state === 'train-first-model' &&
      <StartReview
        handleAppState={props.setAppState}
      />
      }

      {props.app_state === 'review-import' &&
      <ImportDialog
        handleAppState={props.setAppState}
        toggleImportProject={toggleImportProject}
        importProject={importProject}
      />
      }

      {props.app_state === 'review' &&
      <ReviewZone
        handleAppState={props.setAppState}
        reviewDrawerState={appState['reviewDrawerOpen']}
        handleReviewDrawer={handleReviewDrawer}
        showAuthors={authors}
        textSize={textSize}
        undoEnabled={undoEnabled}
      />
      }

      {props.app_state === 'review-complete' &&
      <ReviewZoneComplete
        handleAppState={props.setAppState}
        toggleExportResult={toggleExportResult}
      />
      }

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
      />
      <HistoryDialog
        openHistory={openHistory}
        handleHistoryClose={handleHistoryClose}
      />
      <ExitDialog
        toggleExit={toggleExit}
        exit={exit}
      />
      <ExportDialog
        toggleExportResult={toggleExportResult}
        exportResult={exportResult}
      />
    </ThemeProvider>
  );
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
