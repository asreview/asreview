import React from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { Routes, Route } from "react-router-dom";
import "typeface-roboto";
import { CssBaseline, createTheme, useMediaQuery } from "@mui/material";
import { ThemeProvider, StyledEngineProvider } from "@mui/material/styles";
import "./App.css";

import { HelpDialog, NavigationDrawer, SettingsDialog } from "./Components";
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

const queryClient = new QueryClient();

const App = (props) => {
  // Dialog state
  const [onSettings, toggleSettings] = useToggle();
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

  return (
    <QueryClientProvider client={queryClient}>
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={muiTheme}>
          <CssBaseline />
          <div aria-label="nav and main content">
            <Routes>
              <Route index element={<BootPage />} />
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
                      projectCheck={projectCheck}
                      setProjectCheck={setProjectCheck}
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
                    />
                  }
                />
              </Route>
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
