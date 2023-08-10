import * as React from "react";
import { Box, Fab, Stack } from "@mui/material";
import { Add } from "@mui/icons-material";
import {
  DashboardPageHeader,
  NumberCard,
  ProjectTable,
} from "../DashboardComponents";
import { useToggle } from "../../hooks/useToggle";
import { ActionsFeedbackBar } from "../../Components";
import { ProjectImportDialog } from "../../ProjectComponents";
import { SetupDialog } from "../../ProjectComponents/SetupComponents";

const ProjectsOverview = (props) => {
  const [onImportDialog, toggleImportDialog] = useToggle();
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
        mobileScreen={props.mobileScreen}
        toggleImportDialog={toggleImportDialog}
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
            toggleAcceptanceSetup={props.AcceptanceDialog}
          />
        </Stack>
      </Box>
      <Fab
        className="main-page-fab"
        color="primary"
        onClick={props.toggleProjectSetup}
        variant="extended"
      >
        <Add sx={{ mr: 1 }} />
        Create
      </Fab>
      <ProjectImportDialog
        mobileScreen={props.mobileScreen}
        open={onImportDialog}
        onClose={toggleImportDialog}
        setFeedbackBar={setFeedbackBar}
      />
      <SetupDialog
        mobileScreen={props.mobileScreen}
        open={props.onProjectSetup}
        onClose={props.toggleProjectSetup}
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
