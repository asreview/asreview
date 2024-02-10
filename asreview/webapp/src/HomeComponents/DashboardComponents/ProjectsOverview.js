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
import {
  AddPriorKnowledge,
  ImportDataset,
} from "../../ProjectComponents/SetupComponents/DataComponents";

import { useToggle } from "../../hooks/useToggle";

const ProjectsOverview = (props) => {
  const [onAddPrior, toggleAddPrior] = useToggle();
  const [onModePick, toggleModePick] = useToggle();
  const [onImportDataset, toggleImportDataset] = useToggle();
  const [onImportProject, toggleImportProject] = useToggle();

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

  console.log(
    "ProjectsOverview.js: props.projectSetup.project_id: ",
    props.projectSetup.project_id,
  );

  return (
    <>
      <DashboardPageHeader
        mobileScreen={props.mobileScreen}
        toggleImportProject={toggleImportProject}
      />
      <Box className="main-page-body-wrapper">
        <Stack className="main-page-body" spacing={6}>
          <NumberCard mobileScreen={props.mobileScreen} />
          <ProjectTable
            onNavDrawer={props.onNavDrawer}
            projectCheck={props.projectCheck}
            setFeedbackBar={setFeedbackBar}
            setProjectCheck={props.setProjectCheck}
            toggleModePick={toggleModePick}
            toggleProjectSetup={props.toggleProjectSetup}
            toggleAcceptanceSetup={props.AcceptanceDialog}
          />
        </Stack>
      </Box>
      <Fab
        id="create-project"
        className="main-page-fab"
        color="primary"
        onClick={toggleModePick}
        variant="extended"
      >
        <Add sx={{ mr: 1 }} />
        Create
      </Fab>
      <ModePickDialog
        open={onModePick}
        toggleModePick={toggleModePick}
        toggleImportDataset={toggleImportDataset}
      />
      <AddPriorKnowledge
        project_id={props.projectSetup.project_id}
        open={onAddPrior}
        mobileScreen={props.mobileScreen}
        toggleAddPrior={toggleAddPrior}
      />
      <ImportDataset
        open={onImportDataset}
        datasetAdded={false}
        mobileScreen={props.mobileScreen}
        toggleImportDataset={toggleImportDataset}
        toggleProjectSetup={props.toggleProjectSetup}
      />
      <ImportProject
        mobileScreen={props.mobileScreen}
        open={onImportProject}
        toggleImportProject={toggleImportProject}
        setFeedbackBar={setFeedbackBar}
      />
      {/* <SetupDialog
        project_id={props.projectSetup.project_id}
        mobileScreen={props.mobileScreen}
        open={props.projectSetup.open}
        onClose={props.toggleProjectSetup}
        setFeedbackBar={setFeedbackBar}
        toggleAddPrior={toggleAddPrior}
        toggleImportDataset={toggleImportDataset}
      /> */}
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
