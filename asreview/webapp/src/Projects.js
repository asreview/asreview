import React, {useState, useEffect} from 'react';
import {
  Backdrop,
  Box,
  Container,
  Grid,
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
  PublishOutlined,
} from '@material-ui/icons';

import ProjectCard from './ProjectCard';

import { api_url } from './globals.js';

import axios from 'axios';

const useStyles = makeStyles(theme => ({
  root: {
    paddingTop: '24px',
  },
  absolute: {
    position: 'absolute',
    bottom: theme.spacing(2),
    right: theme.spacing(3),
  },
  noProjects: {
    opacity: 0.5,
  },
}));

const Projects = (props) => {

    const classes = useStyles();

    const [open, setOpen] = useState(false);
    const [projects, setProjects] = useState({
      "projects": [],
      "loaded": false,
    });

    const actions = [
      { icon: <AddOutlined />, name: 'New', operation: "newProject"},
      { icon: <PublishOutlined />, name: 'Import', operation: "importProject" },
    ];

    useEffect(() => {

      refreshProjects();

    }, []);

    const refreshProjects = () => {

      const url = api_url + "projects";

      axios.get(url)
        .then((result) => {
          setProjects({
            "projects": result.data['result'],
            "loaded": true,
          });
        })
        .catch((error) => {
          console.log(error);
        });
    };

    const handleOpen = () => {
      setOpen(true);
    };

    const handleClose = () => {
      setOpen(false);
    };

    const handleClickAdd = (event, operation) => {
      event.preventDefault();
      if (operation === "newProject") {
        props.handleAppState("review-init");
      } else if (operation === "importProject") {
        props.handleAppState("review-import");
        props.toggleImportProject();
      };
    }


    return (
        <Container maxWidth='md' className={classes.root}>

        {/* Project loaded, but no projects found */}
        {(projects['loaded'] && projects['projects'].length === 0) &&
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
        {(projects['loaded'] && projects['projects'].length !== 0) &&
          <Grid container spacing={3}>
              {projects['projects'].map(project => (
                  <Grid item sm={4} key={project.id}>
                    <ProjectCard
                      className={classes.paper}
                      id={project.id}
                      name={project.name}
                      description={project.description}
                      handleAppState={props.handleAppState}
                      refreshProjects={refreshProjects}
                    />
                </Grid>
              ))}
          </Grid>
        }

        {/* Add button for new or importing project */}
        <div>
          <Backdrop open={open} />
          <SpeedDial
            ariaLabel="add"
            className={classes.absolute}
            FabProps={{color: "secondary"}}
            icon={<SpeedDialIcon />}
            onClose={handleClose}
            onOpen={handleOpen}
            open={open}
          >
            {actions.map((action) => (
              <SpeedDialAction
                key={action.name}
                icon={action.icon}
                tooltipTitle={action.name}
                tooltipOpen
                onClick={event => {handleClickAdd(event, action.operation)}}
              />
            ))}
          </SpeedDial>
        </div>
        </Container>
    );
}

export default Projects;
