import * as React from "react";
import { Box, Fab, Stack } from "@mui/material";
import { Add } from "@mui/icons-material";
import { DashboardPageHeader, ProjectTable } from ".";
import { ActionsFeedbackBar, InteractionButtons } from "Components";
import { ImportProject } from "ProjectComponents";
import { SetupDialog } from "ProjectComponents/SetupComponents";

import { useToggle } from "hooks/useToggle";

const ProjectsOverview = ({
  mobileScreen,
  projectCheck,
  setProjectCheck,
  mode,
}) => {
  const [onImportProject, toggleImportProject] = useToggle();

  const modeLabel = {
    simulate: "Simulate",
    oracle: "Review",
    explore: "Validate",
  };

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
          <ProjectTable
            mode={mode}
            projectCheck={projectCheck}
            setFeedbackBar={setFeedbackBar}
            setProjectCheck={setProjectCheck}
            mobileScreen={mobileScreen}
          />

          <InteractionButtons />
        </Stack>
      </Box>
      <Fab
        id="create-project"
        className="main-page-fab"
        color="primary"
        onClick={toggleCreateProject}
        variant="extended"
      >
        <Add sx={{ mr: 1 }} />
        {modeLabel[mode]}
      </Fab>
      <SetupDialog
        mode={mode}
        mobileScreen={mobileScreen}
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
