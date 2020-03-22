import React, {
  useState
} from 'react'
import {
  CssBaseline,
  createMuiTheme 
} from '@material-ui/core'
import { MuiThemeProvider } from '@material-ui/core/styles';
import axios from 'axios'
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

import { api_url } from './Components/globals.js'
import 'typeface-roboto'

import { connect } from "react-redux";


const App = () => {

  console.log("render App")

  // We keep the theme in app state
  const [theme, setTheme] = useState({
    palette: {
      type: "light",
      primary: brown,
      // {
      //   // light: will be calculated from palette.primary.main,
      //   main: '#ffc107',
      //   // dark: will be calculated from palette.primary.main,
      //   // contrastText: will be calculated to contrast with palette.primary.main
      // },
      // secondary: {
      //   light: '#0066ff',
      //   main: '#0044ff',
      //   // dark: will be calculated from palette.secondary.main,
      //   contrastText: '#ffcc00',
      // },
    },
  });

  // we generate a MUI-theme from state's theme object
  const muiTheme = createMuiTheme(theme);

  // const [appState, setAppState] = React.useState('review'); // useful for debugging
  const [appState, setAppState] = React.useState('projects'); // useful for debugging Default: boot
  const [openSettings, setSettingsOpen] = React.useState(false);
  const [exit, setExit] = React.useState(false);
  const [exportResult, setExportResult] = React.useState(false);
  const [openHistory, setHistoryOpen] = React.useState(false);
  const [authors, setAuthors] = React.useState(false); 

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
    console.log("Open settings");
    setSettingsOpen(true);
  };

  const handleClose = () => {
    console.log("Close settings");
    setSettingsOpen(false);
  };


  const handleHistoryOpen = () => {
    console.log("Open history");
    setHistoryOpen(true);
  };

  const handleHistoryClose = () => {
    console.log("Close history");
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
  
  /**
   * Get article info on specific article
   * 
   * @param doc_id - the article's doc_id
   */
  const getArticleInfo = (doc_id) => {
    const url = api_url + "document/" + doc_id + "/info";
    return axios.get(url)
    .then((result) => {
      console.log(result);
    })
    .catch((err) => {
      console.log(err)
    })
  }

  const handleUndo = () => {
    console.log('Function call: handleUndo()');
  }

  const handleExit = () => {
    console.log('Function call: handleExit()');
  }

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
      />
      }      

      {appState === 'review' &&
      <ReviewZone
        reviewDrawerState={reviewDrawerState}
        handleReviewDrawer={handleReviewDrawer}
        showAuthors={authors}
        handleUndo={handleUndo}
        handleExit={handleExit}
      />
      }

    {/* Dialogs */}
      <SettingsDialog
        openSettings={openSettings}
        handleClose={handleClose}
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
