import React from 'react';
import {
    Typography,
    ListSubheader,
    ListItem,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

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
            Project name: {props.project_name} 
          </ListItem>
          <ListItem key="project-authors">
            Project authors: {props.project_authors} 
          </ListItem>
        </div>

    );
}

export default ProjectPanel;