import { Box, Snackbar, Stack } from "@mui/material";
import { InteractionButtons } from "Components";
import { SetupDialog } from "ProjectComponents/SetupComponents";
import * as React from "react";
import { DashboardPageHeader, Projects } from ".";

import { useToggle } from "hooks/useToggle";

const ProjectsOverview = ({ mobileScreen, mode }) => {
  const [openCreateProject, toggleCreateProject] = useToggle(false);

  const [feedbackBar, setFeedbackBar] = React.useState({
    open: false,
    message: null,
  });

  const resetFeedbackBar = () => {
    setFeedbackBar({
      ...feedbackBar,
      open: false,
    });
  };

  return (
    <>
      <DashboardPageHeader mode={mode} setFeedbackBar={setFeedbackBar} />
      <Box className="main-page-body-wrapper">
        <Stack className="main-page-body" spacing={6}>
          <Projects
            mode={mode}
            setFeedbackBar={setFeedbackBar}
            mobileScreen={mobileScreen}
          />

          <InteractionButtons />
        </Stack>
      </Box>
      <SetupDialog
        mode={mode}
        open={openCreateProject}
        onClose={toggleCreateProject}
        setFeedbackBar={setFeedbackBar}
      />
      <Snackbar
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        open={feedbackBar.open}
        autoHideDuration={6000}
        onClose={resetFeedbackBar}
        message={feedbackBar.message}
      />
    </>
  );
};

export default ProjectsOverview;
