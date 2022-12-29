import React from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { useSelector, useDispatch } from 'react-redux';
import { Routes, Route } from "react-router-dom";
import "typeface-roboto";
import { Box, CssBaseline, createTheme, useMediaQuery } from "@mui/material";
import CircularProgress from '@mui/material/CircularProgress';
import { ThemeProvider, StyledEngineProvider } from "@mui/material/styles";
import "./App.css";

import { BaseAPI } from "./api/index.js";
import { setBootData, setOAuthServices } from "./redux/actions";

import {
  ForgotPassword,
  HelpDialog,
  NavigationDrawer,
  RequireAuth,
  PersistSignIn,
  ResetPassword,
  SettingsDialog,
  SignIn,
  SignInOAuthCallback,
  SignUpForm
} from "./Components";
import { HomePage } from "./HomeComponents";
import { ProjectPage } from "./ProjectComponents";
import {
  useDarkMode,
  useFontSize,
  useKeyPressEnabled,
  useUndoEnabled,
} from "./hooks/SettingsHooks";
import { useToggle } from "./hooks/useToggle";

const queryClient = new QueryClient();

const App = (props) => {
  // state related stuff for booting the app
  const [appReady, setAppReadyState] = React.useState(false)
  const dispatch = useDispatch();
  const authentication = useSelector(state => state.authentication);
  const allowAccountCreation = useSelector(state => state.allow_account_creation);
  const emailVerification = useSelector(state => state.email_verification);

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
  // from the backend
  React.useEffect(() => {
    let result = BaseAPI.boot({})
    .then(response => {
      dispatch(setBootData(response));
      // set oauth services if there are any
      if (response?.oauth) {
        dispatch(setOAuthServices(response.oauth));
      }
    })
    .catch(err => { console.log(err); });
  }, [])

  // This effect makes sure we handle routing at the 
  // moment we know for sure if there is, or isn't authentication.
  React.useEffect(() => {
    if (
        authentication !== undefined &&
        allowAccountCreation !== undefined &&
        emailVerification !== undefined
      ) {
        setAppReadyState(true);
    } else {
        setAppReadyState(false);
    }
  }, [authentication])


  const render_sign_routes = () => {
    return (
      <>
        { allowAccountCreation &&
          <Route
            path="/signup"
            element={<SignUpForm mobileScreen={mobileScreen} />}
          />
        }
        <Route
            path="/signin"
            element={<SignIn mobileScreen={mobileScreen} />}
        />
        <Route
            path="/oauth_callback"
            element={<SignInOAuthCallback mobileScreen={mobileScreen} />}
        />
        <Route
          path="/forgot_password"
          element={<ForgotPassword mobileScreen={mobileScreen} />}
        />
        <Route
          path="/reset_password"
          element={<ResetPassword mobileScreen={mobileScreen} />}
        />
        {
          emailVerification &&
          <Route
            path="/confirm_account"
            element={<SignUpForm mobileScreen={mobileScreen} />}
          />
        }
      </>
    );
  }

  const render_routes = () => {
    return (
      <>
        {/* Public or Private routes, depending on authentication */}
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
      </>
    )
  };

  return (
    <QueryClientProvider client={queryClient}>
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={muiTheme}>
          <CssBaseline />

          <div aria-label="nav and main content">
            { (appReady === false) && 
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                minHeight="100vh"
              >
                <CircularProgress/>
              </Box>
            }
            { (appReady === true) && (authentication === false) && 
              <Routes>{render_routes()}</Routes> }

            { (appReady === true) && (authentication === true) && 
              <Routes>
                { render_sign_routes() }
                <Route element={<PersistSignIn />}>
                  { render_routes() }
                </Route>
              </Routes>
            }
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
