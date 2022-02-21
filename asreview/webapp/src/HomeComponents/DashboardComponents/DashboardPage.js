import React from "react";
import { Box, Fab, Fade, Stack } from "@mui/material";
import { styled } from "@mui/material/styles";
import { Add } from "@mui/icons-material";

import { ActionsFeedbackBar, QuickTourDialog } from "../../Components";
import { ProjectImportDialog } from "../../ProjectComponents";
import {
  DashboardPageHeader,
  NumberCard,
  ProjectTable,
} from "../DashboardComponents";
import { SetupDialog } from "../../ProjectComponents/SetupComponents";

import { useToggle } from "../../hooks/useToggle";

const Root = styled("div")(({ theme }) => ({}));

const DashboardPage = (props) => {
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
    <Root aria-label="projects page">
      <Fade in>
        <Box>
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
      <QuickTourDialog />
    </Root>
  );
};

export default DashboardPage;
