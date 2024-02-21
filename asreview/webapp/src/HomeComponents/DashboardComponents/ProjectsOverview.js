import * as React from "react";
import { Box, Fab, Stack } from "@mui/material";
import { Add } from "@mui/icons-material";
import {
  DashboardPageHeader,
  NumberCard,
  ProjectTable,
} from "../DashboardComponents";
import { ActionsFeedbackBar } from "../../Components";
import { ImportProject } from "../../ProjectComponents";
import {
  ModePickDialog,
  SetupDialog,
} from "../../ProjectComponents/SetupComponents";
import { AddPriorKnowledge } from "../../ProjectComponents/SetupComponents/PriorComponents";
import { ImportDataset } from "../../ProjectComponents/SetupComponents/DataComponents";

import { useToggle } from "../../hooks/useToggle";

const ProjectsOverview = ({ mobileScreen, projectCheck, setProjectCheck }) => {
  const [onImportProject, toggleImportProject] = useToggle();

  const [onCreateProject, setCreateProject] = React.useState({
    mode: false,
    data: false,
    setup: false,
    project_id: null,
  });

  const openModePick = () => {
    setCreateProject({
      mode: true,
      data: false,
      setup: false,
      project_id: null,
    });
  };

  const closeModePick = () => {
    setCreateProject({
      ...onCreateProject,
      mode: false,
    });
  };

  const closeModePickAndOpenData = (mode_id) => {
    setCreateProject({
      mode: false,
      data: true,
      setup: false,
      // project_id: null,
      mode_id: mode_id,
    });
  };

  const closeDataPick = () => {
    setCreateProject({
      mode: false,
      data: false,
      setup: false,
      // project_id: null,
    });
  };

  const closeDataPickAndOpenSetup = (project_id) => {
    setCreateProject({
      mode: false,
      data: false,
      setup: true,
      project_id: project_id,
    });
  };

  const closeProjectSetup = () => {
    setCreateProject({
      mode: false,
      data: false,
      setup: false,
      // project_id: null,
    });
  };

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
        mobileScreen={mobileScreen}
        toggleImportProject={toggleImportProject}
      />
      <Box className="main-page-body-wrapper">
        <Stack className="main-page-body" spacing={6}>
          <NumberCard mobileScreen={mobileScreen} />
          <ProjectTable
            projectCheck={projectCheck}
            setFeedbackBar={setFeedbackBar}
            setProjectCheck={setProjectCheck}
            toggleModePick={openModePick}
          />
        </Stack>
      </Box>
      <Fab
        id="create-project"
        className="main-page-fab"
        color="primary"
        onClick={openModePick}
        variant="extended"
      >
        <Add sx={{ mr: 1 }} />
        Create
      </Fab>
      <ModePickDialog
        open={onCreateProject.mode}
        closeModePick={closeModePick}
        closeModePickAndOpenData={closeModePickAndOpenData}
      />
      <ImportDataset
        open={onCreateProject.data}
        mode={onCreateProject.mode_id}
        mobileScreen={mobileScreen}
        closeDataPick={closeDataPick}
        closeDataPickAndOpenSetup={closeDataPickAndOpenSetup}
      />
      <SetupDialog
        project_id={onCreateProject.project_id}
        mobileScreen={mobileScreen}
        open={onCreateProject.setup}
        onClose={closeProjectSetup}
        setFeedbackBar={setFeedbackBar}
      />
      <ImportProject
        mobileScreen={mobileScreen}
        open={onImportProject}
        toggleImportProject={toggleImportProject}
        setFeedbackBar={setFeedbackBar}
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
