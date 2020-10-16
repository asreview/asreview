import React from 'react'
import {
  DialogTitle,
  IconButton,
} from '@material-ui/core'

import { makeStyles } from '@material-ui/core/styles'

import CloseIcon from '@material-ui/icons/Close';


const useStyles = makeStyles(theme => ({
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
}));


const DialogTitleWithClose = (props) => {

  const classes = useStyles();

  return (
    <DialogTitle>
      {props.title}
      {props.onClose ? (
        <IconButton
          aria-label="close"
          className={classes.closeButton}
          onClick={props.onClose}
        >
          <CloseIcon />
        </IconButton>
      ) : null}
    </DialogTitle>
  )
}

export default DialogTitleWithClose;
