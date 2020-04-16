import React, {useState, useEffect} from 'react';
import {
  Box,
  Container,
  Grid,
  Tooltip,
  Fab,
  Typography,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import AddIcon from '@material-ui/icons/Add';

import ProjectCard from './ProjectCard'

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
  noProjects :{
    opacity: 0.5,
  }
}));


const Projects = (props) => {

    const classes = useStyles();

    const [projects, setProjects] = useState({
      "projects": [],
      "loaded": false,
    });


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
          })
        })
        .catch((error) => {
          console.log(error);
        });
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
                    Start a review by clicking on the red button in the bottom left corner.
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
                      setAppState={props.setAppState}
                      refreshProjects={refreshProjects}
                    />
                </Grid>
              ))}
          </Grid>
        }

        {/* Add button for new project */}
        <Tooltip title="Start new project" aria-label="add">
          <Fab
              color="secondary"
              className={classes.absolute}
              onClick={() => { 
                  props.setAppState('review-init'); 

              }}
          >
            <AddIcon/>
          </Fab>
        </Tooltip>
      </Container>
    );
}

export default Projects;
