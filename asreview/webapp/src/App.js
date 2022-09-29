import React from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { useSelector, useDispatch } from 'react-redux';
import { Routes, Route } from "react-router-dom";
import "typeface-roboto";
import { CssBaseline, createTheme, useMediaQuery } from "@mui/material";
import { ThemeProvider, StyledEngineProvider } from "@mui/material/styles";
import "./App.css";

import { BaseAPI } from "./api/index.js";
import { setASReviewVersion, setAuthentication } from "./redux/actions";


import {
  HelpDialog,
  NavigationDrawer,
  RequireAuth,
  SettingsDialog,
  SignInForm,
  SignUpForm,
  ConditionalWrapper,
} from "./Components";
import { HomePage } from "./HomeComponents";
import { ProjectPage } from "./ProjectComponents";
import BootPage from "./BootPage";
import {
  useDarkMode,
  useFontSize,
  useKeyPressEnabled,
  useUndoEnabled,
} from "./hooks/SettingsHooks";
import { useToggle } from "./hooks/useToggle";
import { SettingsEthernet } from "@mui/icons-material";

const queryClient = new QueryClient();


const App = (props) => {
  // =======
  const [appReady, setAppReadyState] = React.useState(false)

  const dispatch = useDispatch();
  const authentication = useSelector(state => state.authentication);
  const [dummy, setDummy] = React.useState("");



  React.useEffect(() => {
    if (authentication !== undefined) {
        setTimeout(() => setAppReadyState(true), 2000)
    } else {
        setAppReadyState(false);
    }
    return () => {}
  }, [authentication])


  React.useEffect(() => {
    console.log("BOOT CALL");
    let result = BaseAPI.boot({})
      .then(response => {
        dispatch(setAuthentication(response.authentication));
        dispatch(setASReviewVersion(response.version));
      })
      .catch(err => { console.log(err); });
    return () => {

    }
    // const myTimeout = setTimeout(toggleAppReadyState, 5000);
  }, [])




  // Dialog state
  const [onSettings, toggleSettings] = useToggle();
  const [onProjectSetup, toggleProjectSetup] = useToggle();
  const [projectCheck, setProjectCheck] = React.useState({
    open: false,
    issue: null,
    path: "/projects",
    project_id: null,
  });

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
  const [onNavDrawer, toggleNavDrawer] = useToggle(mobileScreen ? false : true);

  const render_rountes = () => {
    return (
      <Routes>
      {/* Public routes */}
      <Route index element={<BootPage />} />
      <Route
          path="signup"
          element={<SignUpForm mobileScreen={mobileScreen} />}
      />
      <Route
          path="signin"
          element={<SignInForm mobileScreen={mobileScreen} />}
      />
      {/* Public or Private routes, depending on authentication */}
      <Route
        path="*"
        element={
            <NavigationDrawer
              mobileScreen={mobileScreen}
              onNavDrawer={onNavDrawer}
              toggleNavDrawer={toggleNavDrawer}
              toggleSettings={toggleSettings}
            />
        }
      >
        <Route
          path="*"
          element={
            <HomePage
              mobileScreen={mobileScreen}
              onNavDrawer={onNavDrawer}
              onProjectSetup={onProjectSetup}
              projectCheck={projectCheck}
              setProjectCheck={setProjectCheck}
              toggleProjectSetup={toggleProjectSetup}
            />
          }
        />
        <Route
          path="projects/:project_id/*"
          element={
            <ProjectPage
              mobileScreen={mobileScreen}
              onNavDrawer={onNavDrawer}
              fontSize={fontSize}
              undoEnabled={undoEnabled}
              keyPressEnabled={keyPressEnabled}
              projectCheck={projectCheck}
              setProjectCheck={setProjectCheck}
              toggleProjectSetup={toggleProjectSetup}
            />
          }
        />
      </Route>
    </Routes>
    )
  };

  return (
    <QueryClientProvider client={queryClient}>
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={muiTheme}>
          <CssBaseline />
          <div aria-label="nav and main content">
            <Routes>
              {/* Public routes */}
              <Route index element={<BootPage />} />



              <Route
          path="projects/:project_id/*"
          element={
            <ProjectPage
              mobileScreen={mobileScreen}
              onNavDrawer={onNavDrawer}
              fontSize={fontSize}
              undoEnabled={undoEnabled}
              keyPressEnabled={keyPressEnabled}
              projectCheck={projectCheck}
              setProjectCheck={setProjectCheck}
              toggleProjectSetup={toggleProjectSetup}
            />
          }
        />


            </Routes>
          </div>

          {/* Dialogs */}
          <SettingsDialog
            mobileScreen={mobileScreen}
            onSettings={onSettings}
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
          <HelpDialog mobileScreen={mobileScreen} />
        </ThemeProvider>
      </StyledEngineProvider>
    </QueryClientProvider>
  );
};

export default App;
