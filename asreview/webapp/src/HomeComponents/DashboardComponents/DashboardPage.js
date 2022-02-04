import React from "react";
import { Box, Fade, Stack } from "@mui/material";
import { styled } from "@mui/material/styles";

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
  const [onSetupDialog, toggleSetupDialog] = useToggle();
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
    <Root aria-label="dashboard page">
      <Fade in>
        <Box>
          <DashboardPageHeader
            mobileScreen={props.mobileScreen}
            toggleSetupDialog={toggleSetupDialog}
            toggleImportDialog={toggleImportDialog}
          />
          <Box className="main-page-body-wrapper">
            <Stack className="main-page-body" spacing={6}>
              <NumberCard mobileScreen={props.mobileScreen} />
              <ProjectTable
                handleAppState={props.handleAppState}
                handleNavState={props.handleNavState}
                onNavDrawer={props.onNavDrawer}
                toggleNavDrawer={props.toggleNavDrawer}
                toggleSetupDialog={toggleSetupDialog}
              />
            </Stack>
          </Box>
        </Box>
      </Fade>
      <ProjectImportDialog
        mobileScreen={props.mobileScreen}
        open={onImportDialog}
        onClose={toggleImportDialog}
        setFeedbackBar={setFeedbackBar}
      />
      <SetupDialog
        handleAppState={props.handleAppState}
        handleNavState={props.handleNavState}
        mobileScreen={props.mobileScreen}
        open={onSetupDialog}
        onClose={toggleSetupDialog}
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
