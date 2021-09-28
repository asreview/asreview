import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import clsx from "clsx";
import {
  Backdrop,
  Box,
  Container,
  Fade,
  SpeedDial,
  SpeedDialIcon,
  SpeedDialAction,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { AddOutlined, CreateNewFolderOutlined } from "@mui/icons-material";

import ErrorHandler from "./ErrorHandler";
import ProjectTable from "./ProjectTable";

import {
  DashboardStatsPaper,
  ImportDialog,
  NavigationDrawer,
  QuickTourDialog,
} from "./Components";

import { ProjectInfo } from "./PreReviewComponents";

import { ProjectAPI } from "./api/index.js";
import { drawerWidth } from "./globals.js";

const PREFIX = "Projects";

const classes = {
  root: `${PREFIX}-root`,
  content: `${PREFIX}-content`,
  contentShift: `${PREFIX}-contentShift`,
  fab: `${PREFIX}-fab`,
  noProjects: `${PREFIX}-noProjects`,
  backdropZ: `${PREFIX}-backdropZ`,
};

const StyledBox = styled(Box)(({ theme }) => ({
  [`& .${classes.root}`]: {
    paddingTop: "24px",
  },

  [`& .${classes.content}`]: {
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    overflowY: "scroll",
    height: `calc(100vh - 56px)`,
    // WebkitOverflowScrolling: "touch",
    [`${theme.breakpoints.up("xs")} and (orientation: landscape)`]: {
      height: `calc(100vh - 48px)`,
    },
    [theme.breakpoints.up("sm")]: {
      height: `calc(100vh - 64px)`,
    },
    [theme.breakpoints.up("md")]: {
      marginLeft: 72,
    },
  },

  [`& .${classes.contentShift}`]: {
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: drawerWidth,
  },

  [`& .${classes.fab}`]: {
    position: "fixed",
    right: theme.spacing(3),
    bottom: theme.spacing(3),
  },

  [`& .${classes.noProjects}`]: {
    opacity: 0.5,
  },

  [`& .${classes.backdropZ}`]: {
    zIndex: 1000,
  },
}));

const mapStateToProps = (state) => {
  return {
    app_state: state.app_state,
  };
};

const Projects = (props) => {
  const [open, setOpen] = useState({
    dial: false,
    newProject: false,
    importProject: false,
  });

  const [projects, setProjects] = useState({
    projects: [],
    loaded: false,
  });

  const [error, setError] = useState({
    code: null,
    message: null,
  });

  useEffect(() => {
    refreshProjects();
  }, [error.message]);

  const refreshProjects = () => {
    ProjectAPI.projects()
      .then((result) => {
        setProjects({
          projects: result.data["result"],
          loaded: true,
        });
      })
      .catch((error) => {
        setError({
          code: error.code,
          message: error.message,
        });
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

  const handleCloseImportProject = () => {
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

  return (
    <StyledBox aria-label="nav-main">
      <NavigationDrawer
        mobileScreen={props.mobileScreen}
        onNavDrawer={props.onNavDrawer}
        toggleNavDrawer={props.toggleNavDrawer}
        toggleSettings={props.toggleSettings}
      />
      <Box
        component="main"
        className={clsx(classes.content, {
          [classes.contentShift]: !props.mobileScreen && props.onNavDrawer,
        })}
        aria-label="dashboard"
      >
        <Fade in={props.app_state === "projects"}>
          <div>
            <Container maxWidth="md" className={classes.root}>
              <DashboardStatsPaper />
            </Container>
            <Container maxWidth="md" className={classes.root}>
              {error["message"] !== null && (
                <ErrorHandler error={error} setError={setError} />
              )}

              {/* Project loaded, but no projects found */}
              {error["message"] === null &&
                projects["loaded"] &&
                projects["projects"].length === 0 && (
                  <Box className={classes.noProjects}>
                    <Typography variant="h5" align="center">
                      You don't have any projects yet.
                    </Typography>
                    <Box fontStyle="italic">
                      <Typography align="center">
                        Start a review by clicking on the red button in the
                        bottom right corner.
                      </Typography>
                    </Box>
                  </Box>
                )}

              {/* Project loaded and projects found */}
              {error["message"] === null &&
                projects["loaded"] &&
                projects["projects"].length !== 0 && (
                  <ProjectTable
                    projects={projects}
                    handleAppState={props.handleAppState}
                    onNavDrawer={props.onNavDrawer}
                    toggleNavDrawer={props.toggleNavDrawer}
                  />
                )}
            </Container>

            {open.newProject && (
              <ProjectInfo
                handleAppState={props.handleAppState}
                open={open.newProject}
                onClose={handleCloseNewProject}
              />
            )}

            {open.importProject && (
              <ImportDialog
                handleAppState={props.handleAppState}
                open={open.importProject}
                onClose={handleCloseImportProject}
              />
            )}

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
          </div>
        </Fade>
      </Box>
    </StyledBox>
  );
};

export default connect(mapStateToProps)(Projects);
