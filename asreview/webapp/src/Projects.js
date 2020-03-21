import React, {useState, useEffect} from 'react';
import {
  Box,
  Button,
  Divider,
  Container,
  Typography,
  Fade,
  Paper,
  Grid,
  Tooltip,
  Fab,
  CircularProgress,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
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
}));


const Projects = (props) => {

    const classes = useStyles();

    const [projects, setProjects] = useState([]);

    useEffect(() => {

      const fetchData = async () => {

        const url = api_url + "projects";

        const result = await axios.get(url)
          .then((result) => {
            setProjects(result.data['results']);
          })
          .catch((error) => {
            console.log(error);
          });
      };
      fetchData();

    }, []);


    return (
        <Container maxWidth='md' className={classes.root}>
          <Grid container spacing={3}>
            {projects.map(project => (
              <Grid item sm={4} key={project.id}>
                <ProjectCard
                  className={classes.paper}
                  id={project.id}
                  name={project.name}
                  description={project.description}
                  setAppState={props.setAppState}
                />
              </Grid>
              )
            )
          }
          </Grid>

          {/* Add button for new project */}
          <Tooltip title="Add" aria-label="add">
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
