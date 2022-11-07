import * as React from 'react';
import { StyledIconButton } from "../../StyledComponents/StyledButton.js";
import {
  DialogTitle,
  Dialog,
  Divider,
  Fade,
  Stack,
  Tooltip,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { Close } from "@mui/icons-material";
import CollaborationContents from "./CollaborationContents";

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

const CollaborationDialog = (props) => {

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
      <Fade in={true}>
        <Stack className="dialog-header" direction="row">
          <DialogTitle>Collaborators</DialogTitle>
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
      </Fade>
      <Divider />
      <CollaborationContents
        project_id={props.project_id}
      />
    </StyledDialog>
  );
}

export default CollaborationDialog;


