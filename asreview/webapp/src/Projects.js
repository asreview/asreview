import React, {useState, useEffect} from 'react';
import {
  Backdrop,
  Box,
  Button,
  Container,
  Grid,
  Link,
  Typography,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import {
  SpeedDial,
  SpeedDialIcon,
  SpeedDialAction,
} from '@material-ui/lab';
import {
  AddOutlined,
  CreateNewFolderOutlined,
} from '@material-ui/icons';

import ProjectCard from './ProjectCard';

import {
  ImportDialog,
  QuickTourDialog,
} from './Components'

import {
  ProjectInit
} from './PreReviewComponents'

import { api_url } from './globals.js';

import axios from 'axios';

const useStyles = makeStyles(theme => ({
  root: {
    paddingTop: '24px',
  },
  fab: {
    position: 'fixed',
    right: theme.spacing(3),
    bottom: theme.spacing(3),
  },
  noProjects: {
    opacity: 0.5,
  },
  backdropZ: {
    zIndex: 1000,
  },
  link: {
    paddingLeft: "3px",
  },
  retryButton: {
    position: "relative",
    top: "12px",
  },
}));

const Projects = (props) => {

    const classes = useStyles();

    const [open, setOpen] = useState({
      dial: false,
      newProject: false,
      importProject: false
    });

    const [projects, setProjects] = useState({
      "projects": [],
      "loaded": false,
      "error": null,
      "retry": false,
    });

    useEffect(() => {

      refreshProjects();

    }, [projects.error]);

    const refreshProjects = () => {

      const url = api_url + "projects";

      axios.get(url)
        .then((result) => {
          setProjects({
            "projects": result.data['result'],
            "loaded": true,
            "error": null,
            "retry": false,
          });
        })
        .catch((error) => {
          
          if (error.response) {

            setProjects(s => {return({
              ...s,
              "error": error.response.data.message,
              "retry": true,  
            })});
            console.log(error.response);

          } else {

            setProjects(s => {return({
              ...s,
              "error": "Connection lost with the server. Please restart the software.",
            })});

          }
        });
    };

    const handleOpen = () => {
      setOpen({
        ...open,
        dial: true
      })
    };

    const handleClose = () => {
      setOpen({
        ...open,
        dial: false,
      })
    };

    const handleCloseNewProject = () => {
      setOpen({
        ...open,
        newProject: false,
      })
    };

    const handleCloseImportProject = () => {
      setOpen({
        ...open,
        importProject: false,
      })
    };

    const handleClickAdd = (event, operation) => {

      event.preventDefault();
      if (operation === "newProject") {
        setOpen({
          ...open,
          dial: false,
          newProject: true,
        })
      } else if (operation === "importProject") {
        setOpen({
          ...open,
          dial: false,
          importProject: true,
        })
      };
    }

    const handleClickRetry = () => {
      setProjects(s => {return({
        ...s,
        "error": null,
        "retry": false,
      })});
    };

    return (

      <Box>
          <Container maxWidth='md' className={classes.root}>

          {projects['error'] !== null &&
            <Box>
              <Box className={classes.noProjects}>
                <Typography variant="h5" align="center">
                  {projects.error}
                </Typography>
                <Box fontStyle="italic">
                  <Typography align="center">
                    If the issue remains after retrying, click
                    <Link
                      className={classes.link}
                      href="https://github.com/asreview/asreview/issues/new/choose"
                      target="_blank"
                    >
                      <strong>here</strong>
                    </Link> to report.
                  </Typography>
                </Box>
              </Box>
              {projects['retry'] === true &&
                <Box align="center">
                  <Button 
                    className={classes.retryButton}
                    variant="contained"
                    color="primary"
                    onClick={handleClickRetry}
                  >
                    Retry
                  </Button>
                </Box>
              }
            </Box>
          }

          {/* Project loaded, but no projects found */}
          {(projects['error'] === null && projects['loaded'] && projects['projects'].length === 0) &&
                <Box className={classes.noProjects}>
                  <Typography variant="h5" align="center">
                    You don't have any projects yet.
                  </Typography>
                  <Box fontStyle="italic">
                    <Typography align="center">
                      Start a review by clicking on the red button in the bottom right corner.
                    </Typography>
                  </Box>
                </Box>
          }

          {/* Project loaded and projects found */}
          {(projects['error'] === null && projects['loaded'] && projects['projects'].length !== 0) &&
            <Grid container spacing={3}>
                {projects['projects'].map(project => (
                    <Grid item xs={12} sm={6} key={project.id}>
                      <ProjectCard
                        className={classes.paper}
                        id={project.id}
                        name={project.name}
                        description={project.description}
                        projectInitReady={project.projectInitReady}
                        handleAppState={props.handleAppState}
                        refreshProjects={refreshProjects}
                      />
                  </Grid>
                ))}
            </Grid>
          }

          </Container>


          {open.newProject &&
            <ProjectInit
              handleAppState={props.handleAppState}
              open={open.newProject}
              onClose={handleCloseNewProject}
            />
          }

          {open.importProject &&
            <ImportDialog
              handleAppState={props.handleAppState}
              open={open.importProject}
              onClose={handleCloseImportProject}
            />
          }

          {/* Add button for new or importing project */}
            <Backdrop open={open.dial} className={classes.backdropZ}/>
            <SpeedDial
              ariaLabel="add"
              className={classes.fab}
              FabProps={{color: "secondary"}}
              icon={<SpeedDialIcon />}
              onClose={handleClose}
              onOpen={handleOpen}
              open={open.dial}
            >

            <SpeedDialAction
              key={'Import\u00A0project'}
              icon=<CreateNewFolderOutlined />
              tooltipTitle={'Import\u00A0project'}
              tooltipOpen
              onClick={event => {handleClickAdd(event, "importProject")}}
            />
            <SpeedDialAction
              key={'New\u00A0project'}
              icon=<AddOutlined />
              tooltipTitle={'New\u00A0project'}
              tooltipOpen
              onClick={event => {handleClickAdd(event, "newProject")}}
            />
            </SpeedDial>

        <QuickTourDialog/>
      </Box>
    );
}

export default Projects;
