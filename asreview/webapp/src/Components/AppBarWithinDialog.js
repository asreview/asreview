import React from "react";
import {
  AppBar,
  IconButton,
  Toolbar,
  Typography,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

import CloseIcon from "@material-ui/icons/Close";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import HelpIcon from '@material-ui/icons/Help';

const useStyles = makeStyles((theme) => ({
  appBar: {
    position: 'relative',
  },
  title: {
    marginLeft: theme.spacing(2),
    flex: 1,
  },
}));

const AppBarWithinDialog = (props) => {

  const classes = useStyles();

  return (
    <AppBar className={classes.appBar}>
      <Toolbar>
        <IconButton edge="start" color="inherit" onClick={props.leftIcon}>
          {props.closeIcon ? <CloseIcon /> : <ArrowBackIcon />}
        </IconButton>
        <Typography variant="h6" className={classes.title}>
          {props.title}
        </Typography>
        <IconButton edge="end" color="inherit" href={props.helpIcon} target="_blank">
          <HelpIcon />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};

export default AppBarWithinDialog;
