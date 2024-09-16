import React from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { Routes, Route } from "react-router-dom";
import { CssBaseline, createTheme, useMediaQuery } from "@mui/material";
import MuiAlert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import { ThemeProvider } from "@mui/material/styles";

import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

import "./App.css";

import {
  ConfirmAccount,
  ForgotPassword,
  HelpDialog,
  NavigationDrawer,
  RequireAuth,
  PersistSignIn,
  ResetPassword,
  SettingsDialog,
  SignIn,
  SignInOAuthCallback,
  SignUpForm,
} from "Components";
import { HomePage } from "./HomeComponents";
import { ProjectPage } from "ProjectComponents";
import { useFontSize } from "hooks/SettingsHooks";
import { useToggle } from "hooks/useToggle";

// Ensure that on localhost we use 'localhost' instead of '127.0.0.1'
const currentDomain = window.location.href;
if (currentDomain.includes("127.0.0.1")) {
  let newDomain = currentDomain.replace("127.0.0.1", "localhost");
  window.location.replace(newDomain);
}

// Snackbar Notification Alert
const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const queryClient = new QueryClient();

const App = () => {
  const [notification, setNotification] = React.useState({
    open: false,
    message: "",
    severity: "success",
  });
  const showNotification = (message, severity = "success") => {
    setNotification({ open: true, message: message, severity: severity });
  };
  const handleCloseNotification = () => {
    setNotification((data) => ({ ...data, open: false }));
  };

  // Dialog state
  const [onSettings, toggleSettings] = useToggle();
  const [onHelp, toggleHelp] = useToggle();

  const [projectCheck, setProjectCheck] = React.useState({
    open: false,
    issue: null,
    path: "/projects",
    project_id: null,
  });

  // Settings hook
  const [fontSize, handleFontSizeChange] = useFontSize();

  const muiTheme = createTheme({
    // cssVariables: true,
    colorSchemes: { dark: true },
  });
  const mobileScreen = useMediaQuery(muiTheme.breakpoints.down("md"), {
    noSsr: true,
  });

  // Navigation drawer state
  const [onNavDrawer, toggleNavDrawer] = useToggle(mobileScreen ? false : true);

  const render_sign_routes = () => {
    return (
      <>
        {window.allowAccountCreation && (
          <Route
            path="/signup"
            element={
              <SignUpForm
                mobileScreen={mobileScreen}
                showNotification={window.emailVerification && showNotification}
              />
            }
          />
        )}
        <Route
          path="/signin"
          element={
            <SignIn
              oAuthConfig={window.oAuthConfig}
              allowAccountCreation={window.allowAccountCreation}
              emailVerification={window.emailVerification}
            />
          }
        />
        <Route
          path="/oauth_callback"
          element={<SignInOAuthCallback mobileScreen={mobileScreen} />}
        />
        {window.emailVerification && (
          <Route
            path="/confirm_account"
            element={<ConfirmAccount showNotification={showNotification} />}
          />
        )}
        {window.emailVerification && (
          <>
            <Route
              path="/forgot_password"
              element={
                <ForgotPassword
                  mobileScreen={mobileScreen}
                  showNotification={showNotification}
                />
              }
            />
            <Route
              path="/reset_password"
              element={
                <ResetPassword
                  mobileScreen={mobileScreen}
                  showNotification={showNotification}
                />
              }
            />
          </>
        )}
      </>
    );
  };

  const render_routes = () => {
    return (
      <>
        {/* Public or Private routes, depending on authentication */}
        <Route
          path="*"
          element={
            <RequireAuth enforce_authentication={window.authentication}>
              <NavigationDrawer
                mobileScreen={mobileScreen}
                onNavDrawer={onNavDrawer}
                toggleNavDrawer={toggleNavDrawer}
                toggleSettings={toggleSettings}
                toggleHelp={toggleHelp}
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
                projectCheck={projectCheck}
                setProjectCheck={setProjectCheck}
              />
            }
          />
          <Route
            path="reviews/:project_id/*"
            element={
              <ProjectPage
                mobileScreen={mobileScreen}
                onNavDrawer={onNavDrawer}
                fontSize={fontSize}
                projectCheck={projectCheck}
                setProjectCheck={setProjectCheck}
              />
            }
          />
          <Route
            path="simulations/:project_id/*"
            element={
              <ProjectPage
                mobileScreen={mobileScreen}
                onNavDrawer={onNavDrawer}
                fontSize={fontSize}
                projectCheck={projectCheck}
                setProjectCheck={setProjectCheck}
              />
            }
          />
        </Route>
      </>
    );
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={muiTheme}>
        <CssBaseline />

        <div aria-label="nav and main content">
          {!window.authentication && <Routes>{render_routes()}</Routes>}

          {window.authentication && (
            <Routes>
              {render_sign_routes()}
              <Route element={<PersistSignIn />}>{render_routes()}</Route>
            </Routes>
          )}
        </div>

        <Snackbar
          open={notification.open}
          autoHideDuration={6000}
          onClose={handleCloseNotification}
        >
          <Alert
            onClose={handleCloseNotification}
            severity={notification.severity}
            sx={{ width: "100%" }}
          >
            {notification.message}
          </Alert>
        </Snackbar>

        <SettingsDialog
          mobileScreen={mobileScreen}
          onSettings={onSettings}
          fontSize={fontSize}
          toggleSettings={toggleSettings}
          handleFontSizeChange={handleFontSizeChange}
        />
        <HelpDialog
          mobileScreen={mobileScreen}
          onHelp={onHelp}
          toggleHelp={toggleHelp}
        />
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
