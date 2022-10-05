import React from "react";
import { useMutation } from "react-query";
import { connect } from "react-redux";
import { Box, Fab, Fade, Stack } from "@mui/material";
import { styled } from "@mui/material/styles";
import { Add } from "@mui/icons-material";

import { ActionsFeedbackBar } from "../../Components";
import { ImportProject } from "../../ProjectComponents";
import {
  DashboardPageHeader,
  ModePickDialog,
  NumberCard,
  ProjectTable,
} from "../DashboardComponents";
import { SetupDialog } from "../../ProjectComponents/SetupComponents";
import {
  AddPriorKnowledge,
  ImportDataset,
} from "../../ProjectComponents/SetupComponents/DataComponents";

import { ProjectAPI } from "../../api/index.js";
import { useToggle } from "../../hooks/useToggle";
import { mapDispatchToProps, projectModes } from "../../globals";

const Root = styled("div")(({ theme }) => ({}));

const DashboardPage = (props) => {
  const [onModePick, setOnModePick] = React.useState(false);
  const [selectedMode, setSelectedMode] = React.useState(projectModes.ORACLE);

  const [onImportDataset, toggleImportDataset] = useToggle();
  const [onImportProject, toggleImportProject] = useToggle();
  const [onAddPrior, toggleAddPrior] = useToggle();

  const [feedbackBar, setFeedbackBar] = React.useState({
    open: false,
    message: null,
  });

  /**
   * Initiate a new project.
   */
  const { error, isError, isLoading, mutate, reset } = useMutation(
    ProjectAPI.mutateInitProject,
    {
      onSuccess: (data, variables) => {
        setOnModePick(false);
        props.setProjectId(data["id"]);
        toggleImportDataset();
      },
    }
  );

  const handleClickCreate = () => {
    setOnModePick(true);
  };

  const handleCloseModePick = (value) => {
    if (value) {
      if (value !== "import") {
        setSelectedMode(value);
        mutate({
          mode: value,
        });
      } else {
        setOnModePick(false);
        toggleImportProject();
      }
    } else {
      if (!isLoading) {
        setOnModePick(false);
      }
    }
  };

  const resetFeedbackBar = () => {
    setFeedbackBar({
      ...feedbackBar,
      open: false,
    });
  };

  return (
    <Root aria-label="projects page">
      <Fade in>
        <Box>
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
                toggleProjectSetup={props.toggleProjectSetup}
              />
            </Stack>
          </Box>
        </Box>
      </Fade>
      <Fab
        className="main-page-fab"
        color="primary"
        onClick={handleClickCreate}
        variant="extended"
      >
        <Add sx={{ mr: 1 }} />
        Create
      </Fab>
      <ModePickDialog
        error={error}
        isError={isError}
        open={onModePick}
        onClose={handleCloseModePick}
        reset={reset}
      />
      <AddPriorKnowledge
        open={onAddPrior}
        mobileScreen={props.mobileScreen}
        mode={selectedMode}
        n_prior={props.n_prior}
        n_prior_exclusions={props.n_prior_exclusions}
        n_prior_inclusions={props.n_prior_inclusions}
        toggleAddPrior={toggleAddPrior}
      />
      <ImportDataset
        open={onImportDataset}
        datasetAdded={false}
        mobileScreen={props.mobileScreen}
        mode={selectedMode}
        toggleImportDataset={toggleImportDataset}
        toggleProjectSetup={props.toggleProjectSetup}
      />
      <ImportProject
        mobileScreen={props.mobileScreen}
        open={onImportProject}
        onClose={toggleImportProject}
        setFeedbackBar={setFeedbackBar}
      />
      <SetupDialog
        mobileScreen={props.mobileScreen}
        open={props.onProjectSetup}
        onClose={props.toggleProjectSetup}
        selectedMode={selectedMode}
        setFeedbackBar={setFeedbackBar}
      />
      <ActionsFeedbackBar
        center
        onClose={resetFeedbackBar}
        open={feedbackBar.open}
        feedback={feedbackBar.message}
      />
    </Root>
  );
};

export default connect(null, mapDispatchToProps)(DashboardPage);
