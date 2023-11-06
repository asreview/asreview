import * as React from "react";
import { Dialog, Divider } from "@mui/material";
import { styled } from "@mui/material/styles";
import AcceptanceContents from "./AcceptanceContents";
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

const AcceptanceDialog = (props) => {
  const handleClose = () => {
    props.onClose();
  };

  return (
    <StyledDialog
      aria-label="acceptance dialog"
      open={props.open}
      fullScreen={props.mobileScreen}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: { height: !props.mobileScreen ? "calc(100% - 96px)" : "100%" },
      }}
    >
      <DialogHeader
        title="Collaboration invitations"
        handleClose={handleClose}
      />
      <Divider />
      <AcceptanceContents
        projectInvitations={props.projectInvitations}
        handleAcceptance={props.handleAcceptance}
        handleRejection={props.handleRejection}
      />
    </StyledDialog>
  );
};

export default AcceptanceDialog;
