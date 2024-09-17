import * as React from "react";
import { Box, Fab, Stack, Snackbar } from "@mui/material";
import { Add } from "@mui/icons-material";
import { DashboardPageHeader, Projects } from ".";
import { InteractionButtons } from "Components";
import { SetupDialog } from "ProjectComponents/SetupComponents";

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
      <DashboardPageHeader mode={mode} />
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
