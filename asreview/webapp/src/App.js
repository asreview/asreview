import React from 'react'
import {
  CssBaseline,
  createMuiTheme
} from '@material-ui/core'
import { MuiThemeProvider } from '@material-ui/core/styles';
import './App.css';

import {
  Header,
  ReviewZone,
  HistoryDialog,
  ExportDialog,
  ImportDialog,
}
from './Components'
import PreReviewZone from './PreReviewComponents/PreReviewZone'
import ReviewZoneComplete from './PostReviewComponents/ReviewZoneComplete'
import Projects from './Projects'
import SettingsDialog from './SettingsDialog'
import ExitDialog from './ExitDialog'
import WelcomeScreen from './WelcomeScreen'
import {
  useDarkMode,
  useTextSize,
} from './SettingsHooks'

import 'typeface-roboto'



const App = () => {

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
  const [textSize, handleTextSizeChange] = useTextSize()

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
      'step': appState['step'],
      'reviewDrawerOpen': show,
    })
  }

  console.log("Current step: " + appState['step'])

  return (
      <MuiThemeProvider theme={muiTheme}>
      <CssBaseline/>
      {appState['step'] === 'boot' &&
      <WelcomeScreen
        handleAppState={handleAppState}
      />
      }
      {appState['step'] !== 'boot' &&
      <Header

        /* Handle the app state */
        appState={appState['step']}
        handleAppState={handleAppState}

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

      {appState['step'] === 'projects' &&
      <Projects
        handleAppState={handleAppState}
        toggleImportProject={toggleImportProject}
      />
      }

      {appState['step'] === 'review-init' &&
      <PreReviewZone
        handleAppState={handleAppState}
      />
      }

      {appState['step'] === 'review-import' &&
      <ImportDialog
        handleAppState={handleAppState}
        toggleImportProject={toggleImportProject}
        importProject={importProject}
      />
      }

      {appState['step'] === 'review' &&
      <ReviewZone
        handleAppState={handleAppState}
        reviewDrawerState={appState['reviewDrawerOpen']}
        handleReviewDrawer={handleReviewDrawer}
        showAuthors={authors}
        textSize={textSize}
      />
      }

      {appState['step'] === 'review-complete' &&
      <ReviewZoneComplete
        handleAppState={handleAppState}
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
    </MuiThemeProvider>
  );
}

export default App;
