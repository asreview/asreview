import React from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { useSelector, useDispatch } from 'react-redux';
import { Routes, Route } from "react-router-dom";
import "typeface-roboto";
import { CssBaseline, createTheme, useMediaQuery } from "@mui/material";
import { ThemeProvider, StyledEngineProvider } from "@mui/material/styles";
import "./App.css";

import { BaseAPI } from "./api/index.js";
import { setBootData } from "./redux/actions";


import {
  HelpDialog,
  NavigationDrawer,
  RequireAuth,
  PersistSignIn,
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
  // state related stuff for booting the app
  const [appReady, setAppReadyState] = React.useState(false)
  const dispatch = useDispatch();
  const authentication = useSelector(state => state.authentication);
  const status = useSelector(state => state.status);

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

  // This effect does a boot request to gather information 
  // about the backend
  React.useEffect(() => {
    let result = BaseAPI.boot({})
      .then(response => {
        const delay = (response.status === 'development')? 3000 : 3000;
        // in production we set a 3 secs delay to show the logo,
        // in development we immediately set the boot-data
        setTimeout(() => {
            dispatch(setBootData(response));
        }, delay);
      })
      .catch(err => { console.log(err); });
  }, [])

  // This effect makes sure we handle routing at the 
  // moment we know for sure if there is, or isn't authentication.
  React.useEffect(() => {
    if (authentication !== undefined) {
        setAppReadyState(true);
    } else {
        setAppReadyState(false);
    }
  }, [authentication])



  const render_sign_routes = () => {
    return (
      <>
        <Route
            path="/signup"
            element={<SignUpForm mobileScreen={mobileScreen} />}
        />
        <Route
            path="/signin"
            element={<SignInForm mobileScreen={mobileScreen} />}
        />
      </>
    );
  }

  const render_routes = () => {
    return (
      <Routes>
        {/* authentication-related routes */}
        { (authentication === true) && render_sign_routes() }

        {/* Public or Private routes, depending on authentication */}
        <Route element={<PersistSignIn />}>
          <Route
            path="*"
            element={
              <RequireAuth enforce_authentication={authentication}>
                <NavigationDrawer
                  mobileScreen={mobileScreen}
                  onNavDrawer={onNavDrawer}
                  toggleNavDrawer={toggleNavDrawer}
                  toggleSettings={toggleSettings}
                />
              </RequireAuth>
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
            { (appReady === false) && <BootPage /> }
            { (appReady === true) && render_routes() }
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
