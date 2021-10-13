import React, { useState } from "react";
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
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { AddOutlined, CreateNewFolderOutlined } from "@mui/icons-material";

import {
  DashboardStats,
  ProjectImportDialog,
  ProjectTable,
  NavigationDrawer,
  QuickTourDialog,
} from "../Components";
import { ProjectInfo } from "../PreReviewComponents";

import { drawerWidth } from "../globals.js";

const PREFIX = "Dashboard";

const classes = {
  root: `${PREFIX}-root`,
  content: `${PREFIX}-content`,
  contentShift: `${PREFIX}-contentShift`,
  fab: `${PREFIX}-fab`,
  noProjects: `${PREFIX}-noProjects`,
  backdropZ: `${PREFIX}-backdropZ`,
};

const Root = styled("div")(({ theme }) => ({
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

  [`& .${classes.backdropZ}`]: {
    zIndex: 1000,
  },
}));

const mapStateToProps = (state) => {
  return {
    app_state: state.app_state,
  };
};

const Dashboard = (props) => {
  const [open, setOpen] = useState({
    dial: false,
    newProject: false,
    importProject: false,
  });

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

  return (
    <Root aria-label="nav-main">
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
        <Fade in={props.app_state === "dashboard"}>
          <div>
            <Container maxWidth="md" className={classes.root}>
              <DashboardStats />
            </Container>
            <Container maxWidth="md" className={classes.root}>
              <ProjectTable
                handleClickAdd={handleClickAdd}
                onCreateProject={open.newProject}
                handleAppState={props.handleAppState}
                onNavDrawer={props.onNavDrawer}
                toggleNavDrawer={props.toggleNavDrawer}
              />
            </Container>

            {open.newProject && (
              <ProjectInfo
                handleAppState={props.handleAppState}
                open={open.newProject}
                onClose={handleCloseNewProject}
              />
            )}

            {open.importProject && (
              <ProjectImportDialog
                open={open.importProject}
                onClose={handleCloseProjectImport}
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
    </Root>
  );
};

export default connect(mapStateToProps)(Dashboard);
