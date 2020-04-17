import React, {
  useState
} from 'react'
import {
  CssBaseline,
  createMuiTheme
} from '@material-ui/core'
import { MuiThemeProvider } from '@material-ui/core/styles';
import './App.css';

import brown from '@material-ui/core/colors/brown';
import {
  Header,
  SettingsDialog,
  ReviewZone,
  HistoryDialog,
  ExitDialog,
  ExportDialog,
}
from './Components'
import PreReviewZone from './PreReviewComponents/PreReviewZone'
import Projects from './Projects'
import WelcomeScreen from './WelcomeScreen'

import 'typeface-roboto'



const App = () => {

  // We keep the theme in app state
  const [theme, setTheme] = useState({
    palette: {
      type: "light",
      primary: brown,
    },
  });

  // we generate a MUI-theme from state's theme object
  const muiTheme = createMuiTheme(theme);

  const [appState, setAppState] = React.useState('boot');
  const [openSettings, setSettingsOpen] = React.useState(false);
  const [exit, setExit] = React.useState(false);
  const [exportResult, setExportResult] = React.useState(false);
  const [openHistory, setHistoryOpen] = React.useState(false);
  const [authors, setAuthors] = React.useState(false);
  const [textSize, setTextSize] = React.useState('Normal');

  // we change the palette type of the theme in state
  const toggleDarkTheme = () => {
    let newPaletteType = theme.palette.type === "light" ? "dark" : "light";
    setTheme({
      palette: {
        type: newPaletteType,
        primary: brown
      }
    });
  };

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

  const [reviewDrawerState, setReviewDrawerState] = useState(false);

  const handleReviewDrawer = (show) => {
    //console.log('Set drawer to '+(show?'open':'closed'));
    setReviewDrawerState(show);
  }

  const handleTextSizeChange = (event) => {
    setTextSize(event.target.value);
  };  

  console.log("Current step: " + appState)

  return (
      <MuiThemeProvider theme={muiTheme}>
      <CssBaseline/>
      {appState === 'boot' &&
      <WelcomeScreen
        setAppState={setAppState}
      />
      }
      {appState !== 'boot' &&
      <Header
        appState={appState}
        setAppState={setAppState}
        reviewDrawerState={reviewDrawerState}
        handleReviewDrawer={handleReviewDrawer}
        toggleDarkTheme={toggleDarkTheme}
        handleClickOpen={handleClickOpen}
        handleHistoryOpen={handleHistoryOpen}
        handleTextSizeChange={handleTextSizeChange}
        toggleExit={toggleExit}
        toggleExportResult={toggleExportResult}
      />
      }

      {appState === 'projects' &&
      <Projects
        setAppState={setAppState}
      />
      }

      {appState === 'review-init' &&
      <PreReviewZone
        setAppState={setAppState}
        handleReviewDrawer={handleReviewDrawer}
      />
      }

      {appState === 'review' &&
      <ReviewZone
        reviewDrawerState={reviewDrawerState}
        handleReviewDrawer={handleReviewDrawer}
        showAuthors={authors}
        textSize={textSize}
      />
      }

    {/* Dialogs */}
      <SettingsDialog
        openSettings={openSettings}
        handleClose={handleClose}
        handleTextSizeChange={handleTextSizeChange}
        textSize={textSize}
        toggleDarkTheme={toggleDarkTheme}
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
