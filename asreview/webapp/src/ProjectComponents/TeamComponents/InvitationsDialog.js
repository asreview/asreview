import * as React from "react";
import { Dialog, DialogTitle, Divider, Stack, Tooltip } from "@mui/material";
import { Close } from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import { InvitationsComponent } from "ProjectComponents/TeamComponents";
import { StyledIconButton } from "StyledComponents/StyledButton";

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

const InvitationsDialog = (props) => {
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
      <Stack className="dialog-header" direction="row">
        <DialogTitle>Collaboration invitations</DialogTitle>
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <Stack
            className="dialog-header-button right"
            direction="row"
            spacing={1}
          >
            <Tooltip title="Close">
              <StyledIconButton onClick={handleClose}>
                <Close />
              </StyledIconButton>
            </Tooltip>
          </Stack>
        </Stack>
      </Stack>

      <Divider />

      <InvitationsComponent
        projectInvitations={props.projectInvitations}
        handleAcceptance={props.handleAcceptance}
        handleRejection={props.handleRejection}
      />
    </StyledDialog>
  );
};

export default InvitationsDialog;
