import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
  Modal,
  Backdrop,
  Fade,
  Typography,
  CircularProgress,
} from '@material-ui/core';

const useStyles = makeStyles(theme => ({
  modal: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paper: {
    backgroundColor: theme.palette.background.paper,
    border: '2px solid #000',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
  spinner: {
    paddingTop: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
}));

const DecisionFeedback = (props) => {
  const classes = useStyles();

  return (
    <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        className={classes.modal}
        open={props.open}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
            transitionDuration: {enter: 200, exit: 200},
        }}
    >
        <Fade in={props.open} timeout={{enter: 200, exit: 200}}>
          <div className={classes.paper}>
              <Typography variant="h6">{props.text}</Typography>
              {props.elas?<div className={classes.spinner}><CircularProgress color="inherit" /></div>:''}
          </div>
        </Fade>
    </Modal>
  );
}

export default DecisionFeedback