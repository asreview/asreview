import * as React from "react";
import { Box, Fab, Stack } from "@mui/material";
import { Add } from "@mui/icons-material";
import { DashboardPageHeader, Projects } from ".";
import { ActionsFeedbackBar, InteractionButtons } from "Components";
import { ImportProject } from "ProjectComponents";
import { SetupDialog } from "ProjectComponents/SetupComponents";

import { useToggle } from "hooks/useToggle";

const ProjectsOverview = ({ mobileScreen, mode }) => {
  const [onImportProject, toggleImportProject] = useToggle();

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
      <DashboardPageHeader
        mode={mode}
        mobileScreen={mobileScreen}
        toggleImportProject={toggleImportProject}
      />
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
      <Fab
        id="create-project"
        color="primary"
        onClick={toggleCreateProject}
        variant="extended"
        sx={{
          position: "absolute",
          bottom: 24,
          right: 24,
        }}
      >
        <Add sx={{ mr: 1 }} />
        {"new"}
      </Fab>
      <SetupDialog
        mode={mode}
        open={openCreateProject}
        onClose={toggleCreateProject}
        setFeedbackBar={setFeedbackBar}
      />
      <ImportProject
        mobileScreen={mobileScreen}
        onImportProject={onImportProject}
        toggleImportProject={toggleImportProject}
      />
      <ActionsFeedbackBar
        center
        onClose={resetFeedbackBar}
        open={feedbackBar.open}
        feedback={feedbackBar.message}
      />
    </>
  );
};

export default ProjectsOverview;
