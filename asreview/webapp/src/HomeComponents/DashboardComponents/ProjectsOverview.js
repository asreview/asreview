import * as React from "react";
import { Box, Stack } from "@mui/material";
import {
  DashboardPageHeader,
  NumberCard,
  ProjectTable,
} from "../DashboardComponents";
import { useToggle } from "../../hooks/useToggle";

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
    </>
  );
};

export default ProjectsOverview;