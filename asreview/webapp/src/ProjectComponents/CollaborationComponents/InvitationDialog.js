import * as React from 'react';
import {
  Dialog,
  Divider,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import InvitationContents from "./InvitationContents";
import DialogHeader from "./DialogHeader";

const PREFIX = "SetupDialog";

const classes = {
  content: `${PREFIX}-content`,
  stepper: `${PREFIX}-stepper`,
  form: `${PREFIX}-form`,
  formWarmup: `${PREFIX}-form-warmup`,
};

const StyledDialog = styled(Dialog)(({ theme }) => ({
  [`& .${classes.content}`]: {
    paddingLeft: 0,
    paddingRight: 0,
    overflowY: "hidden",
  },

  [`& .${classes.stepper}`]: {
    padding: 8,
  },

  [`& .${classes.form}`]: {
    height: "calc(100% - 60px)",
    overflowY: "scroll",
    padding: "32px 48px 48px 48px",
  },

  [`& .${classes.formWarmup}`]: {
    alignItems: "center",
    display: "flex",
    justifyContent: "center",
  },
}));

const InvitationDialog = (props) => {

  const handleClose = () => {
    props.toggleCollaboDialog();
  };

  return (
    <StyledDialog
      aria-label="collaboration setup"
      open={props.openCollaboDialog}
      fullScreen={props.mobileScreen}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: { height: !props.mobileScreen ? "calc(100% - 96px)" : "100%" },
      }}
    >
      <DialogHeader
        title="Collaborators"
        handleClose={handleClose}
      />
      <Divider />
      <InvitationContents
        project_id={props.project_id}
      />
    </StyledDialog>    
  );
}

export default InvitationDialog;


