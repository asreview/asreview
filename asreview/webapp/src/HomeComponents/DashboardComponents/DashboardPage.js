import React from "react";
import { connect } from "react-redux";
import {
  Backdrop,
  Container,
  SpeedDial,
  SpeedDialIcon,
  SpeedDialAction,
  Stack,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { AddOutlined, CreateNewFolderOutlined } from "@mui/icons-material";

import { ProjectImportDialog, QuickTourDialog } from "../../Components";
import { NumberCard, ProjectTable } from "../DashboardComponents";
import {
  CloseSetupInfoBar,
  SetupDialog,
} from "../../ProjectComponents/SetupComponents";
import { useToggle } from "../../hooks/useToggle";

const PREFIX = "DashboardPage";

const classes = {
  root: `${PREFIX}-root`,
  fab: `${PREFIX}-fab`,
  noProjects: `${PREFIX}-noProjects`,
  backdropZ: `${PREFIX}-backdropZ`,
};

const Root = styled("div")(({ theme }) => ({
  padding: "48px 0px",
  height: "100%",
  [`& .${classes.root}`]: {
    paddingTop: "24px",
  },

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

  const [newProjectTitle, setNewProjectTitle] = React.useState("");
  const [infoBar, toggleInfoBar] = useToggle();

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
      <Container maxWidth="md">
        <Stack spacing={5}>
          <NumberCard />
          <ProjectTable
            handleClickAdd={handleClickAdd}
            handleProjectSetup={handleProjectSetup}
            handleAppState={props.handleAppState}
            handleNavState={props.handleNavState}
            onNavDrawer={props.onNavDrawer}
            toggleNavDrawer={props.toggleNavDrawer}
          />
        </Stack>
      </Container>

      {open.importProject && (
        <ProjectImportDialog
          open={open.importProject}
          onClose={handleCloseProjectImport}
        />
      )}

      <SetupDialog
        handleAppState={props.handleAppState}
        open={open.newProject}
        onClose={handleCloseNewProject}
        setNewProjectTitle={setNewProjectTitle}
        toggleInfoBar={toggleInfoBar}
      />
      <CloseSetupInfoBar
        onClose={toggleInfoBar}
        open={infoBar}
        setNewProjectTitle={setNewProjectTitle}
        info={`Your project ${newProjectTitle} has been saved as draft`}
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
