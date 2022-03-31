import React from "react";
import { DialogTitle, IconButton } from "@mui/material";
import { styled } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";

const PREFIX = "DialogTitleWithClose";

const classes = {
  closeButton: `${PREFIX}-closeButton`,
};

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  [`& .${classes.closeButton}`]: {
    position: "absolute",
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
}));

const DialogTitleWithClose = (props) => {
  return (
    <StyledDialogTitle>
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
    </StyledDialogTitle>
  );
};

export default DialogTitleWithClose;
