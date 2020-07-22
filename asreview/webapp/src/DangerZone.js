import React, {useRef, useEffect}  from 'react'
import { makeStyles } from '@material-ui/core/styles'

import {
  Box,
  Button,
  Container,
  Stepper,
  Step,
  StepLabel,
  StepButton,
  Typography,
  CircularProgress,
  Paper,
  List,
  ListItemIcon,
  Divider,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
} from '@material-ui/core';

import ProjectSettings from './ProjectSettings.js'


import KeyboardVoiceIcon from '@material-ui/icons/KeyboardVoice';
import InboxIcon from '@material-ui/icons/Inbox';


import { connect } from "react-redux";
import store from './redux/store'

import axios from 'axios'

import { api_url, mapStateToProps } from './globals.js';

const useStyles = makeStyles(theme => ({
  header: {
    paddingTop: "128px",
    paddingBottom: "84px",
    textAlign: "center",
  },
  title: {
    fontWeight: "300",
    letterSpacing: ".7rem",
  },
  continuButton: {
    marginTop: "24px",
  },
  wrapper: {
    margin: theme.spacing(1),
    position: 'relative',
  },
  buttonProgress: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: 0,
    marginLeft: -12,
  },
  dangerZone : {
    borderColor: "red",
    borderWidth: "2px",
    borderStyle: "solid",
    boxShadow: "none",
}
}));

const DangerZone = (props) => {

  const classes = useStyles();

  const [settings, setDelete] = React.useState(false);


  const toggleProjectDelete = () => {
    setDelete(a => (!a));
  };

  return (
    <Paper className={classes.dangerZone}>
     <List className={classes.root}>
        <ListItem alignItems="flex-start">
          <ListItemText
            primary="Archive this project"
            secondary={'Mark this project as archived and read-only.'}
          />
        </ListItem>
        <Divider component="li" />
        <ListItem button onClick={toggleProjectDelete} alignItems="flex-start">
          <ListItemText
            primary="Delete this project"
            secondary={'Once you delete a project, there is no going back. Please be certain.'}
          />
        </ListItem>
      </List>
    <ProjectSettings
      id={props.project_id}
      settings={settings}
      toggleProjectDelete={toggleProjectDelete}
    />
    </Paper>
  )
}

export default DangerZone;
