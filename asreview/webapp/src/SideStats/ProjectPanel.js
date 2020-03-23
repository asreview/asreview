import React from 'react';
import {
    ListSubheader,
    ListItem,
    Typography,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    fontWeight: theme.typography.fontWeightRegular,
  },
}));

const ProjectPanel = (props) => {
    const classes = useStyles();

    return (
        <div>
          <ListSubheader component="div" id="list-subheader-project">
            Project
          </ListSubheader> 
          {/*<LinearProgress variant="determinate" value="10" color="primary" />*/}
          <ListItem key="project-name">
            Project: {props.name}
          </ListItem>
          <ListItem key="project-authors">
            Authors: {props.authors}
          </ListItem>
          <ListItem key="project-n-papers">
            Number of publications: {props.n_papers} 
          </ListItem>
        </div>

    );
}

export default ProjectPanel;