import React from "react";
import { DialogTitle, IconButton } from "@mui/material";

import makeStyles from "@mui/styles/makeStyles";

import CloseIcon from "@mui/icons-material/Close";

const useStyles = makeStyles((theme) => ({
  closeButton: {
    position: "absolute",
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
          size="large"
        >
          <CloseIcon />
        </IconButton>
      ) : null}
    </DialogTitle>
  );
};

export default DialogTitleWithClose;
