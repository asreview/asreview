import React from "react";
import { connect } from "react-redux";
import {
  Backdrop,
  Box,
  Fade,
  SpeedDial,
  SpeedDialIcon,
  SpeedDialAction,
  Stack,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { AddOutlined, CreateNewFolderOutlined } from "@mui/icons-material";

import { ActionsFeedbackBar, QuickTourDialog } from "../../Components";
import { ProjectImportDialog } from "../../ProjectComponents";
import {
  DashboardPageHeader,
  NumberCard,
  ProjectTable,
} from "../DashboardComponents";
import { SetupDialog } from "../../ProjectComponents/SetupComponents";

const PREFIX = "DashboardPage";

const classes = {
  fab: `${PREFIX}-fab`,
  noProjects: `${PREFIX}-noProjects`,
  backdropZ: `${PREFIX}-backdropZ`,
};

const Root = styled("div")(({ theme }) => ({
  [`& .${classes.fab}`]: {
    position: "fixed",
    right: theme.spacing(3),
    bottom: theme.spacing(3),
  },

  [`& .${classes.backdropZ}`]: {
    zIndex: 1000,
  },
}));

const mapStateToProps = (state) => {
  return {
    nav_state: state.nav_state,
    project_id: state.project_id,
  };
};

const DashboardPage = (props) => {
  const [open, setOpen] = React.useState({
    dial: false,
    newProject: false,
    importProject: false,
  });

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

  const handleOpen = () => {
    setOpen({
      ...open,
      dial: true,
    });
  };

  const handleClose = () => {
    setOpen({
      ...open,
      dial: false,
    });
  };

  const handleCloseNewProject = () => {
    setOpen({
      ...open,
      newProject: false,
    });
  };

  const handleCloseProjectImport = () => {
    setOpen({
      ...open,
      importProject: false,
    });
  };

  const handleClickAdd = (event, operation) => {
    event.preventDefault();
    if (operation === "newProject") {
      setOpen({
        ...open,
        dial: false,
        newProject: true,
      });
    } else if (operation === "importProject") {
      setOpen({
        ...open,
        dial: false,
        importProject: true,
      });
    }
  };

  const handleProjectSetup = () => {
    setOpen({
      ...open,
      newProject: true,
    });
  };

  return (
    <Root aria-label="dashboard page">
      <Fade in>
        <Box>
          <DashboardPageHeader mobileScreen={props.mobileScreen} />
          <Box className="main-page-body-wrapper">
            <Stack className="main-page-body" spacing={6}>
              <NumberCard mobileScreen={props.mobileScreen} />
              <ProjectTable
                handleClickAdd={handleClickAdd}
                handleProjectSetup={handleProjectSetup}
                handleAppState={props.handleAppState}
                handleNavState={props.handleNavState}
                onNavDrawer={props.onNavDrawer}
                toggleNavDrawer={props.toggleNavDrawer}
              />
            </Stack>
          </Box>
        </Box>
      </Fade>
      <ProjectImportDialog
        mobileScreen={props.mobileScreen}
        open={open.importProject}
        onClose={handleCloseProjectImport}
        setFeedbackBar={setFeedbackBar}
      />
      <SetupDialog
        handleAppState={props.handleAppState}
        handleNavState={props.handleNavState}
        mobileScreen={props.mobileScreen}
        open={open.newProject}
        onClose={handleCloseNewProject}
        setFeedbackBar={setFeedbackBar}
      />
      <ActionsFeedbackBar
        center
        onClose={resetFeedbackBar}
        open={feedbackBar.open}
        feedback={feedbackBar.message}
      />

      {/* Add button for new or importing project */}
      <Backdrop open={open.dial} className={classes.backdropZ} />
      <SpeedDial
        ariaLabel="add"
        className={classes.fab}
        FabProps={{ color: "primary" }}
        icon={<SpeedDialIcon />}
        onClose={handleClose}
        onOpen={handleOpen}
        open={open.dial}
      >
        <SpeedDialAction
          key={"Import\u00A0project"}
          icon=<CreateNewFolderOutlined />
          tooltipTitle={"Import\u00A0project"}
          tooltipOpen
          onClick={(event) => {
            handleClickAdd(event, "importProject");
          }}
        />
        <SpeedDialAction
          key={"New\u00A0project"}
          icon=<AddOutlined />
          tooltipTitle={"New\u00A0project"}
          tooltipOpen
          onClick={(event) => {
            handleClickAdd(event, "newProject");
          }}
        />
      </SpeedDial>

      <QuickTourDialog />
    </Root>
  );
};

export default connect(mapStateToProps)(DashboardPage);
